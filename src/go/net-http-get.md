---
title: net/http Get请求
icon: go
date: 2024-03-21
category: go
tag: 
    - go
    - network
---

net/http Get请求

<!-- more -->


```go
import(
	"net/http"
)

func main(){
	resp, err := http.Get("google.com")
}
```

其中这个http.Get请求到底是怎么做的, resp这个到底是怎么得到的

那么查看`http.Get`函数的实现, 一路点下去
```go
func (c *Client) do(req *Request) (retres *Response, reterr error) { }
```

在调用链的最后会找到一个这样的函数, 其中我们略过不重要的部分, 找到最精髓的地方

```go
func (c *Client) do(req *Request) (retres *Response, reterr error) { 
	// ...
	for{
		// ...
		if resp, didTimeout, err = c.send(req, deadline); err != nil {
		}
	}
}
```

其中注意到`c.send(req, deadline)` 这个函数, 其中返回值就是我们想要的`resp`, `req`是我们之前拼接的请求, 那么我们继续看 ~~其实看到send就大致明白后面和什么有关系了~~
```go
func (c *Client) send(req *Request, deadline time.Time) (resp *Response, didTimeout func() bool, err error) {
	// ...
	resp, didTimeout, err = send(req, c.transport(), deadline)
	// ...
}

```

ok, 继续看,`send`的实现
```go
// send issues an HTTP request.
// Caller should close resp.Body when done reading from it.
func send(ireq *Request, rt RoundTripper, deadline time.Time) (resp *Response, didTimeout func() bool, err error) {
	// ...
	resp, err = rt.RoundTrip(req)
	// ...
}
```

看`rt.RoundTrip`的实现, 而其中这个是一个接口, 这个接口的具体实现是在`net/http/roundtrip.go`这个文件下实现的，继续
```go
// RoundTrip implements the RoundTripper interface.
//
// For higher-level HTTP client support (such as handling of cookies
// and redirects), see Get, Post, and the Client type.
//
// Like the RoundTripper interface, the error types returned
// by RoundTrip are unspecified.
func (t *Transport) RoundTrip(req *Request) (*Response, error) {
	return t.roundTrip(req)
}

```

继续
```go
// roundTrip implements a RoundTripper over HTTP.
func (t *Transport) roundTrip(req *Request) (*Response, error) {
	t.nextProtoOnce.Do(t.onceSetNextProtoDefaults)
	ctx := req.Context()
	trace := httptrace.ContextClientTrace(ctx)

	// ...
	for {
		select {
		case <-ctx.Done():
			req.closeBody()
			return nil, ctx.Err()
		default:
		}

		// ...

		// Get the cached or newly-created connection to either the
		// host (for http or https), the http proxy, or the http proxy
		// pre-CONNECTed to https server. In any case, we'll be ready
		// to send it requests.
		pconn, err := t.getConn(treq, cm)
		if err != nil {
			t.setReqCanceler(cancelKey, nil)
			req.closeBody()
			return nil, err
		}

		var resp *Response
		if pconn.alt != nil {
			// HTTP/2 path.
			t.setReqCanceler(cancelKey, nil) // not cancelable with CancelRequest
			resp, err = pconn.alt.RoundTrip(req)
		} else {
			resp, err = pconn.roundTrip(treq)
		}
		if err == nil {
			resp.Request = origReq
			return resp, nil
		}

		// ... 
	}
}

```
重点是 `pconn, err := t.getConn(treq, cm)` 和 `resp, err = pconn.roundTrip(treq)`, 只走http/1.0 or http/1.1, 不走http/2.0
~~其实出现conn也很接近了~~
```go
func (pc *persistConn) roundTrip(req *transportRequest) (resp *Response, err error) {
	testHookEnterRoundTrip()

	resc := make(chan responseAndError)
	pc.reqch <- requestAndChan{
		req:        req.Request,
		cancelKey:  req.cancelKey,
		ch:         resc,
		addedGzip:  requestedGzip,
		continueCh: continueCh,
		callerGone: gone,
	}

	var respHeaderTimer <-chan time.Time
	cancelChan := req.Request.Cancel
	ctxDoneChan := req.Context().Done()
	pcClosed := pc.closech
	canceled := false
	for {
		testHookWaitResLoop()
		select {
		case err := <-writeErrCh:
			// ...
		case <-pcClosed:
			// ...
		case <-respHeaderTimer:
			// ...
		case re := <-resc:
			if (re.res == nil) == (re.err == nil) {
				panic(fmt.Sprintf("internal error: exactly one of res or err should be set; nil=%v", re.res == nil))
			}
			if debugRoundTrip {
				req.logf("resc recv: %p, %T/%#v", re.res, re.err, re.err)
			}
			if re.err != nil {
				return nil, pc.mapRoundTripError(req, startBytesWritten, re.err)
			}
			return re.res, nil
		case <-cancelChan:
			// ...
		case <-ctxDoneChan:
			// ...
		}
	}
}

```
重点是 `for` 中的 `case re:= <- resc` , 如果没有报错并且,re.res是有数据的, 那么返回, 所以我们从找到是谁向resc发送的数据, 以及这个`resc` 这个通道中的数据是哪里来的呢? 注意到
```go
resc := make(chan responseAndError)
	pc.reqch <- requestAndChan{
		req:        req.Request,
		cancelKey:  req.cancelKey,
		ch:         resc,
		addedGzip:  requestedGzip,
		continueCh: continueCh,
		callerGone: gone,
	}
```
这里把`resc`这个channel传给了`pc(persistConnect)` 这个结构体中, 所以我们需要看看是哪个for中用到了这个channel, 继续, 我全文搜索了`reqch`, 然后在这个文件`net/http/transport.go`中找到了它
```go
func (pc *persistConn) readLoop() {
	// ...
	alive := true
	for alive {
		pc.readLimit = pc.maxHeaderResponseSize()
		_, err := pc.br.Peek(1)

		pc.mu.Lock()
		if pc.numExpectedResponses == 0 {
			pc.readLoopPeekFailLocked(err)
			pc.mu.Unlock()
			return
		}
		pc.mu.Unlock()

		rc := <-pc.reqch
		trace := httptrace.ContextClientTrace(rc.req.Context())

		var resp *Response
		if err == nil {
			resp, err = pc.readResponse(rc, trace)
		} else {
			err = transportReadFromServerError{err}
			closeErr = err
		}

		if err != nil {
			if pc.readLimit <= 0 {
				err = fmt.Errorf("net/http: server response headers exceeded %d bytes; aborted", pc.maxHeaderResponseSize())
			}

			select {
			case rc.ch <- responseAndError{err: err}:
			case <-rc.callerGone:
				return
			}
			return
		}
		pc.readLimit = maxInt64 // effectively no limit for response bodies

		pc.mu.Lock()
		pc.numExpectedResponses--
		pc.mu.Unlock()

		bodyWritable := resp.bodyIsWritable()
		hasBody := rc.req.Method != "HEAD" && resp.ContentLength != 0

		if resp.Close || rc.req.Close || resp.StatusCode <= 199 || bodyWritable {
			// Don't do keep-alive on error if either party requested a close
			// or we get an unexpected informational (1xx) response.
			// StatusCode 100 is already handled above.
			alive = false
		}

		if !hasBody || bodyWritable {
			replaced := pc.t.replaceReqCanceler(rc.cancelKey, nil)

			// Put the idle conn back into the pool before we send the response
			// so if they process it quickly and make another request, they'll
			// get this same conn. But we use the unbuffered channel 'rc'
			// to guarantee that persistConn.roundTrip got out of its select
			// potentially waiting for this persistConn to close.
			alive = alive &&
				!pc.sawEOF &&
				pc.wroteRequest() &&
				replaced && tryPutIdleConn(trace)

			if bodyWritable {
				closeErr = errCallerOwnsConn
			}

			select {
			case rc.ch <- responseAndError{res: resp}:
			case <-rc.callerGone:
				return
			}

			// Now that they've read from the unbuffered channel, they're safely
			// out of the select that also waits on this goroutine to die, so
			// we're allowed to exit now if needed (if alive is false)
			testHookReadLoopBeforeNextRead()
			continue
		}

		waitForBodyRead := make(chan bool, 2)
		body := &bodyEOFSignal{
			body: resp.Body,
			earlyCloseFn: func() error {
				waitForBodyRead <- false
				<-eofc // will be closed by deferred call at the end of the function
				return nil

			},
			fn: func(err error) error {
				isEOF := err == io.EOF
				waitForBodyRead <- isEOF
				if isEOF {
					<-eofc // see comment above eofc declaration
				} else if err != nil {
					if cerr := pc.canceled(); cerr != nil {
						return cerr
					}
				}
				return err
			},
		}

		resp.Body = body
		if rc.addedGzip && ascii.EqualFold(resp.Header.Get("Content-Encoding"), "gzip") {
			resp.Body = &gzipReader{body: body}
			resp.Header.Del("Content-Encoding")
			resp.Header.Del("Content-Length")
			resp.ContentLength = -1
			resp.Uncompressed = true
		}

		select {
		case rc.ch <- responseAndError{res: resp}:
		case <-rc.callerGone:
			return
		}

		// Before looping back to the top of this function and peeking on
		// the bufio.Reader, wait for the caller goroutine to finish
		// reading the response body. (or for cancellation or death)
		select {
		case bodyEOF := <-waitForBodyRead:
			replaced := pc.t.replaceReqCanceler(rc.cancelKey, nil) // before pc might return to idle pool
			alive = alive &&
				bodyEOF &&
				!pc.sawEOF &&
				pc.wroteRequest() &&
				replaced && tryPutIdleConn(trace)
			if bodyEOF {
				eofc <- struct{}{}
			}
		case <-rc.req.Cancel:
			alive = false
			pc.t.CancelRequest(rc.req)
		case <-rc.req.Context().Done():
			alive = false
			pc.t.cancelRequest(rc.cancelKey, rc.req.Context().Err())
		case <-pc.closech:
			alive = false
		}

		testHookReadLoopBeforeNextRead()
	}
}

```

是不是看起来很多? 但是我觉得最重要的部分是这里(好吧确实很多,后面发现了原来这里是不能减少的)
```go
func (pc *persistConn) readLoop() {
	// ...
	alive := true
	for alive {
		// ...
		rc := <-pc.reqch
		trace := httptrace.ContextClientTrace(rc.req.Context())

		var resp *Response
		if err == nil {
			resp, err = pc.readResponse(rc, trace)
		} else {
			err = transportReadFromServerError{err}
			closeErr = err
		}

		// ...
		select {
			case rc.ch <- responseAndError{res: resp}:
			case <-rc.callerGone:
				return
		}
		// ...

		bodyWritable := resp.bodyIsWritable()
		hasBody := rc.req.Method != "HEAD" && resp.ContentLength != 0

		if resp.Close || rc.req.Close || resp.StatusCode <= 199 || bodyWritable {
			// Don't do keep-alive on error if either party requested a close
			// or we get an unexpected informational (1xx) response.
			// StatusCode 100 is already handled above.
			alive = false
		}

		if !hasBody || bodyWritable {
			replaced := pc.t.replaceReqCanceler(rc.cancelKey, nil)

			// Put the idle conn back into the pool before we send the response
			// so if they process it quickly and make another request, they'll
			// get this same conn. But we use the unbuffered channel 'rc'
			// to guarantee that persistConn.roundTrip got out of its select
			// potentially waiting for this persistConn to close.
			alive = alive &&
				!pc.sawEOF &&
				pc.wroteRequest() &&
				replaced && tryPutIdleConn(trace)

			if bodyWritable {
				closeErr = errCallerOwnsConn
			}

			select {
			case rc.ch <- responseAndError{res: resp}:
			case <-rc.callerGone:
				return
			}

			// Now that they've read from the unbuffered channel, they're safely
			// out of the select that also waits on this goroutine to die, so
			// we're allowed to exit now if needed (if alive is false)
			testHookReadLoopBeforeNextRead()
			continue
		}

		waitForBodyRead := make(chan bool, 2)
		body := &bodyEOFSignal{
			body: resp.Body,
			earlyCloseFn: func() error {
				waitForBodyRead <- false
				<-eofc // will be closed by deferred call at the end of the function
				return nil

			},
			fn: func(err error) error {
				isEOF := err == io.EOF
				waitForBodyRead <- isEOF
				if isEOF {
					<-eofc // see comment above eofc declaration
				} else if err != nil {
					if cerr := pc.canceled(); cerr != nil {
						return cerr
					}
				}
				return err
			},
		}

		resp.Body = body
		if rc.addedGzip && ascii.EqualFold(resp.Header.Get("Content-Encoding"), "gzip") {
			resp.Body = &gzipReader{body: body}
			resp.Header.Del("Content-Encoding")
			resp.Header.Del("Content-Length")
			resp.ContentLength = -1
			resp.Uncompressed = true
		}

		select {
		case rc.ch <- responseAndError{res: resp}:
		case <-rc.callerGone:
			return
		}

		// Before looping back to the top of this function and peeking on
		// the bufio.Reader, wait for the caller goroutine to finish
		// reading the response body. (or for cancellation or death)
		select {
		case bodyEOF := <-waitForBodyRead:
			replaced := pc.t.replaceReqCanceler(rc.cancelKey, nil) // before pc might return to idle pool
			alive = alive &&
				bodyEOF &&
				!pc.sawEOF &&
				pc.wroteRequest() &&
				replaced && tryPutIdleConn(trace)
			if bodyEOF {
				eofc <- struct{}{}
			}
		case <-rc.req.Cancel:
			alive = false
			pc.t.CancelRequest(rc.req)
		case <-rc.req.Context().Done():
			alive = false
			pc.t.cancelRequest(rc.cancelKey, rc.req.Context().Err())
		case <-pc.closech:
			alive = false
		}


}
```
总体看下来上面就是发现有`Get`请求过来, 然后`pc.reqch`收到了数据, 这个数据中又有回传回去的`rc.ch` 这个channel, 这个就是之前的 `resc` 这个channel, 那么我们看`pc.readResponse(rc. trace)`是怎么做的
注: 在后面的这一串是处理 body的读取的,前面header和首部的读取就是放在了`pc.readResponse(rc. trace)`这个里面

```go
// readResponse reads an HTTP response (or two, in the case of "Expect:
// 100-continue") from the server. It returns the final non-100 one.
// trace is optional.
func (pc *persistConn) readResponse(rc requestAndChan, trace *httptrace.ClientTrace) (resp *Response, err error) {

	// ...
	for {
		resp, err = ReadResponse(pc.br, rc.req)
	}
	// ...
}
```

ok, 看`ReadResponse(pc.br, rc.req)`是做了什么
```go
// ReadResponse reads and returns an HTTP response from r.
// The req parameter optionally specifies the Request that corresponds
// to this Response. If nil, a GET request is assumed.
// Clients must call resp.Body.Close when finished reading resp.Body.
// After that call, clients can inspect resp.Trailer to find key/value
// pairs included in the response trailer.
func ReadResponse(r *bufio.Reader, req *Request) (*Response, error) {

	tp := textproto.NewReader(r)
	resp := &Response{
		Request: req,
	}
	// Parse the first line of the response.
	line, err := tp.ReadLine()
	if err != nil {
		if err == io.EOF {
			err = io.ErrUnexpectedEOF
		}
		return nil, err
	}
	proto, status, ok := strings.Cut(line, " ")
	if !ok {
		return nil, badStringError("malformed HTTP response", line)
	}
	resp.Proto = proto
	resp.Status = strings.TrimLeft(status, " ")

	statusCode, _, _ := strings.Cut(resp.Status, " ")
	if len(statusCode) != 3 {
		return nil, badStringError("malformed HTTP status code", statusCode)
	}
	resp.StatusCode, err = strconv.Atoi(statusCode)
	if err != nil || resp.StatusCode < 0 {
		return nil, badStringError("malformed HTTP status code", statusCode)
	}
	if resp.ProtoMajor, resp.ProtoMinor, ok = ParseHTTPVersion(resp.Proto); !ok {
		return nil, badStringError("malformed HTTP version", resp.Proto)
	}

	// Parse the response headers.
	mimeHeader, err := tp.ReadMIMEHeader()
	if err != nil {
		if err == io.EOF {
			err = io.ErrUnexpectedEOF
		}
		return nil, err
	}
	resp.Header = Header(mimeHeader)

	fixPragmaCacheControl(resp.Header)

	err = readTransfer(resp, r)
	if err != nil {
		return nil, err
	}

	return resp, nil
}

```
其中上面这一堆是做了首部和header的解析的, 重点是`func ReadResponse(r *bufio.Reader, req *Request) (*Response, error)` 中的`r *bufio.Reader` 从这个东西里面生成出`tp := textproto.NewReader(r)`, 然后是用`line, err := tp.ReadLine()`解析第一行的信息, 其中`ReadLine`这个函数是怎么实现从`bufio.Reader`的结构体中进行数据读取的, 这里就不做详细介绍, 因为这里这里都是实现的细节的问题了, 从这里找下去能够发现很多实现, 我这里想要着重描述的是为什么这个`r *bufio.Reader`就是能从tcp流中读出数据? 所以我们看看这个东西到底是怎么来的
```go
func (pc *persistConn) readResponse(rc requestAndChan, trace *httptrace.ClientTrace) (resp *Response, err error) {
	// ...
	for {
		resp, err = ReadResponse(pc.br, rc.req)
	}
	// ...
}
```
之前的代码中这个的参数是`pc.br`,我们看看这个`pc`的结构体`persistConn`都有什么字段
```go
// persistConn wraps a connection, usually a persistent one
// (but may be used for non-keep-alive requests as well)
type persistConn struct {
	// alt optionally specifies the TLS NextProto RoundTripper.
	// This is used for HTTP/2 today and future protocols later.
	// If it's non-nil, the rest of the fields are unused.
	alt RoundTripper

	t         *Transport
	cacheKey  connectMethodKey
	conn      net.Conn
	tlsState  *tls.ConnectionState
	br        *bufio.Reader       // from conn
	bw        *bufio.Writer       // to conn
	nwrite    int64               // bytes written
	reqch     chan requestAndChan // written by roundTrip; read by readLoop
	writech   chan writeRequest   // written by roundTrip; read by writeLoop
	closech   chan struct{}       // closed when conn closed
	isProxy   bool
	sawEOF    bool  // whether we've seen EOF from conn; owned by readLoop
	readLimit int64 // bytes allowed to be read; owned by readLoop
	// writeErrCh passes the request write error (usually nil)
	// from the writeLoop goroutine to the readLoop which passes
	// it off to the res.Body reader, which then uses it to decide
	// whether or not a connection can be reused. Issue 7569.
	writeErrCh chan error

	writeLoopDone chan struct{} // closed when write loop ends

	// Both guarded by Transport.idleMu:
	idleAt    time.Time   // time it last become idle
	idleTimer *time.Timer // holding an AfterFunc to close it

	mu                   sync.Mutex // guards following fields
	numExpectedResponses int
	closed               error // set non-nil when conn is closed, before closech is closed
	canceledErr          error // set non-nil if conn is canceled
	broken               bool  // an error has happened on this connection; marked broken so it's not reused.
	reused               bool  // whether conn has had successful request/response and is being reused.
	// mutateHeaderFunc is an optional func to modify extra
	// headers on each outbound request before it's written. (the
	// original Request given to RoundTrip is not modified)
	mutateHeaderFunc func(Header)
}

```
我们这边关注的就是`br *bufio.Reader // from conn`, 还有其中的`conn Net.Conn`这个到底是什么时候被赋值的? 或者说这个`pc`是在哪里被初始化的? 因为这个`pc`最开始是在`readLoop`这个函数中被执行的, 我们看看这个函数是在哪里被调用了
```go
func (t *Transport) dialConn(ctx context.Context, cm connectMethod) (pconn *persistConn, err error) {

	pconn = &persistConn{
		t:             t,
		cacheKey:      cm.key(),
		reqch:         make(chan requestAndChan, 1),
		writech:       make(chan writeRequest, 1),
		closech:       make(chan struct{}),
		writeErrCh:    make(chan error, 1),
		writeLoopDone: make(chan struct{}),
	}

	// ...

	pconn.br = bufio.NewReaderSize(pconn, t.readBufferSize())
	pconn.bw = bufio.NewWriterSize(persistConnWriter{pconn}, t.writeBufferSize())

	go pconn.readLoop()
	go pconn.writeLoop()
	return pconn, nil
}
```
ok, 现在我们发现是这个函数`dialConn`进行的函数调用, 并且创建了pconn这个结构体, 那么看函数名dial这个就知道, 这个肯定是用来创建tcp连接的一个操作, 然后通过创建的tcp连接,socket的这个抽象, 然后通过这个来创建一个能够读取socket连接的一个操作, 然后获取到了连接之后创建两个goroutine, 用来监听请求, 因为之前就是`readLoop`这个函数在监听最顶层是`Get`函数调用的发过来的channel, 但是我们这里还发现了一些省略的东西就是真正的tcp连接
```go
func (t *Transport) dialConn(ctx context.Context, cm connectMethod) (pconn *persistConn, err error) {
	// ...
	conn, err := t.dial(ctx, "tcp", cm.addr())
	pconn.conn = conn
	// ...
}
```
其中可以观察一下`conn`这个变量的结构体`net.Conn`
```go
// Conn is a generic stream-oriented network connection.
//
// Multiple goroutines may invoke methods on a Conn simultaneously.
type Conn interface {
	// Read reads data from the connection.
	// Read can be made to time out and return an error after a fixed
	// time limit; see SetDeadline and SetReadDeadline.
	Read(b []byte) (n int, err error)

	// Write writes data to the connection.
	// Write can be made to time out and return an error after a fixed
	// time limit; see SetDeadline and SetWriteDeadline.
	Write(b []byte) (n int, err error)

	// Close closes the connection.
	// Any blocked Read or Write operations will be unblocked and return errors.
	Close() error

	// LocalAddr returns the local network address, if known.
	LocalAddr() Addr

	// RemoteAddr returns the remote network address, if known.
	RemoteAddr() Addr

	// SetDeadline sets the read and write deadlines associated
	// with the connection. It is equivalent to calling both
	// SetReadDeadline and SetWriteDeadline.
	//
	// A deadline is an absolute time after which I/O operations
	// fail instead of blocking. The deadline applies to all future
	// and pending I/O, not just the immediately following call to
	// Read or Write. After a deadline has been exceeded, the
	// connection can be refreshed by setting a deadline in the future.
	//
	// If the deadline is exceeded a call to Read or Write or to other
	// I/O methods will return an error that wraps os.ErrDeadlineExceeded.
	// This can be tested using errors.Is(err, os.ErrDeadlineExceeded).
	// The error's Timeout method will return true, but note that there
	// are other possible errors for which the Timeout method will
	// return true even if the deadline has not been exceeded.
	//
	// An idle timeout can be implemented by repeatedly extending
	// the deadline after successful Read or Write calls.
	//
	// A zero value for t means I/O operations will not time out.
	SetDeadline(t time.Time) error

	// SetReadDeadline sets the deadline for future Read calls
	// and any currently-blocked Read call.
	// A zero value for t means Read will not time out.
	SetReadDeadline(t time.Time) error

	// SetWriteDeadline sets the deadline for future Write calls
	// and any currently-blocked Write call.
	// Even if write times out, it may return n > 0, indicating that
	// some of the data was successfully written.
	// A zero value for t means Write will not time out.
	SetWriteDeadline(t time.Time) error
}
```
我们就选`Read([] byte) (int, error)`这个方法看一下具体实现吧
```go
type conn struct {
	fd *netFD
}

func (c *conn) ok() bool { return c != nil && c.fd != nil }

// Implementation of the Conn interface.

// Read implements the Conn Read method.
func (c *conn) Read(b []byte) (int, error) {
	if !c.ok() {
		return 0, syscall.EINVAL
	}
	n, err := c.fd.Read(b)
	if err != nil && err != io.EOF {
		err = &OpError{Op: "read", Net: c.fd.net, Source: c.fd.laddr, Addr: c.fd.raddr, Err: err}
	}
	return n, err
}
```
其中是很明显是能够看到这个是调用的操作系统的接口的, 因为涉及到了文件描述符了, 然后的话还想要看具体底层的实现就再看`c.fd.Read`函数了, 这里就不再展开说明了

前面讲到, 是`dialConn`这个函数产生的tcp连接以及`go pconn.readLoop()`这个函数, 但是这个和`Get`函数好像没关系啊, 不知道这个函数到底是什么时候调用的, 那么这个时候我们就要找依赖关系了, 看看`dialConn`这个函数是被谁调用的
```go
// dialConnFor dials on behalf of w and delivers the result to w.
// dialConnFor has received permission to dial w.cm and is counted in t.connCount[w.cm.key()].
// If the dial is canceled or unsuccessful, dialConnFor decrements t.connCount[w.cm.key()].
func (t *Transport) dialConnFor(w *wantConn) {
	// ...
	pc, err := t.dialConn(w.ctx, w.cm)
	// ...
}

```
继续找
```go
// queueForDial queues w to wait for permission to begin dialing.
// Once w receives permission to dial, it will do so in a separate goroutine.
func (t *Transport) queueForDial(w *wantConn) {
	w.beforeDial()
	if t.MaxConnsPerHost <= 0 {
		go t.dialConnFor(w)
		return
	}
	// ...
	if n := t.connsPerHost[w.key]; n < t.MaxConnsPerHost {
		// ...
		go t.dialConnFor(w)
		return
	}
	// ...
}

```
继续向上找
```go
// getConn dials and creates a new persistConn to the target as
// specified in the connectMethod. This includes doing a proxy CONNECT
// and/or setting up TLS.  If this doesn't return an error, the persistConn
// is ready to write requests to.
func (t *Transport) getConn(treq *transportRequest, cm connectMethod) (pc *persistConn, err error) {
	// ...
	// Queue for permission to dial.
	t.queueForDial(w)
	// ...
}
```
真相大白了, 原来是在`getConn`的时候就已经创建了这个`pconn`与tcp连接了, 所以能够有一些这样的操作了

## 总结
这里算是看了一下go的`Get`请求是怎么发出来的吧, 以及在`read`的时候是做了一些怎么样的操作的, 其中重点分包的逻辑是在`readLoop`这个函数里面, 以及处理header的一些函数部分, 重点的逻辑还是要看源代码看http协议到底是怎么处理消息协议和分header, body以及怎么处理字节流的, 这里因为篇幅和时间关系重点讲解了一下`resp, err := http.Get()`这个resp到底是怎么产生出来的流程吧

> ps: 接下来可能会考虑开一个新坑就是net/http 中的ListenAndServe这个函数的流程拆解,因为之前也是了解过并且也看过别人的blog和go的源代码的, 但是也没有形成blog这种吧, 所有有时间考虑会写一下这个blog

> 彩蛋:找到的时候发现了TODO和对应的issues哈哈哈, 然后全局搜索了一下发现TODO和issues也蛮多的,咱就是说有时间把TODO都干掉可好?
```go
// Read implements io.Reader.
func (fd *FD) Read(p []byte) (int, error) {
	if err := fd.readLock(); err != nil {
		return 0, err
	}
	defer fd.readUnlock()
	if len(p) == 0 {
		// If the caller wanted a zero byte read, return immediately
		// without trying (but after acquiring the readLock).
		// Otherwise syscall.Read returns 0, nil which looks like
		// io.EOF.
		// TODO(bradfitz): make it wait for readability? (Issue 15735)
		return 0, nil
	}
	if err := fd.pd.prepareRead(fd.isFile); err != nil {
		return 0, err
	}
	if fd.IsStream && len(p) > maxRW {
		p = p[:maxRW]
	}
	for {
		n, err := ignoringEINTRIO(syscall.Read, fd.Sysfd, p)
		if err != nil {
			n = 0
			if err == syscall.EAGAIN && fd.pd.pollable() {
				if err = fd.pd.waitRead(fd.isFile); err == nil {
					continue
				}
			}
		}
		err = fd.eofError(n, err)
		return n, err
	}
}
```
