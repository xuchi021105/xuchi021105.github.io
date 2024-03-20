import{_ as n,W as s,X as a,Y as t,Z as e,a2 as p}from"./framework-eefab691.js";const o={},c=e("p",null,"net/http Get请求",-1),i=p(`<div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">import</span><span class="token punctuation">(</span>
	<span class="token string">&quot;net/http&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
	resp<span class="token punctuation">,</span> err <span class="token operator">:=</span> http<span class="token punctuation">.</span><span class="token function">Get</span><span class="token punctuation">(</span><span class="token string">&quot;google.com&quot;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中这个http.Get请求到底是怎么做的, resp这个到底是怎么得到的</p><p>那么查看<code>http.Get</code>函数的实现, 一路点下去</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token punctuation">(</span>c <span class="token operator">*</span>Client<span class="token punctuation">)</span> <span class="token function">do</span><span class="token punctuation">(</span>req <span class="token operator">*</span>Request<span class="token punctuation">)</span> <span class="token punctuation">(</span>retres <span class="token operator">*</span>Response<span class="token punctuation">,</span> reterr <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>在调用链的最后会找到一个这样的函数, 其中我们略过不重要的部分, 找到最精髓的地方</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token punctuation">(</span>c <span class="token operator">*</span>Client<span class="token punctuation">)</span> <span class="token function">do</span><span class="token punctuation">(</span>req <span class="token operator">*</span>Request<span class="token punctuation">)</span> <span class="token punctuation">(</span>retres <span class="token operator">*</span>Response<span class="token punctuation">,</span> reterr <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> 
	<span class="token comment">// ...</span>
	<span class="token keyword">for</span><span class="token punctuation">{</span>
		<span class="token comment">// ...</span>
		<span class="token keyword">if</span> resp<span class="token punctuation">,</span> didTimeout<span class="token punctuation">,</span> err <span class="token operator">=</span> c<span class="token punctuation">.</span><span class="token function">send</span><span class="token punctuation">(</span>req<span class="token punctuation">,</span> deadline<span class="token punctuation">)</span><span class="token punctuation">;</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中注意到<code>c.send(req, deadline)</code> 这个函数, 其中返回值就是我们想要的<code>resp</code>, <code>req</code>是我们之前拼接的请求, 那么我们继续看 <s>其实看到send就大致明白后面和什么有关系了</s></p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token punctuation">(</span>c <span class="token operator">*</span>Client<span class="token punctuation">)</span> <span class="token function">send</span><span class="token punctuation">(</span>req <span class="token operator">*</span>Request<span class="token punctuation">,</span> deadline time<span class="token punctuation">.</span>Time<span class="token punctuation">)</span> <span class="token punctuation">(</span>resp <span class="token operator">*</span>Response<span class="token punctuation">,</span> didTimeout <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token builtin">bool</span><span class="token punctuation">,</span> err <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// ...</span>
	resp<span class="token punctuation">,</span> didTimeout<span class="token punctuation">,</span> err <span class="token operator">=</span> <span class="token function">send</span><span class="token punctuation">(</span>req<span class="token punctuation">,</span> c<span class="token punctuation">.</span><span class="token function">transport</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> deadline<span class="token punctuation">)</span>
	<span class="token comment">// ...</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>ok, 继续看,<code>send</code>的实现</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token comment">// send issues an HTTP request.</span>
<span class="token comment">// Caller should close resp.Body when done reading from it.</span>
<span class="token keyword">func</span> <span class="token function">send</span><span class="token punctuation">(</span>ireq <span class="token operator">*</span>Request<span class="token punctuation">,</span> rt RoundTripper<span class="token punctuation">,</span> deadline time<span class="token punctuation">.</span>Time<span class="token punctuation">)</span> <span class="token punctuation">(</span>resp <span class="token operator">*</span>Response<span class="token punctuation">,</span> didTimeout <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token builtin">bool</span><span class="token punctuation">,</span> err <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// ...</span>
	resp<span class="token punctuation">,</span> err <span class="token operator">=</span> rt<span class="token punctuation">.</span><span class="token function">RoundTrip</span><span class="token punctuation">(</span>req<span class="token punctuation">)</span>
	<span class="token comment">// ...</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>看<code>rt.RoundTrip</code>的实现, 而其中这个是一个接口, 这个接口的具体实现是在<code>net/http/roundtrip.go</code>这个文件下实现的，继续</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token comment">// RoundTrip implements the RoundTripper interface.</span>
<span class="token comment">//</span>
<span class="token comment">// For higher-level HTTP client support (such as handling of cookies</span>
<span class="token comment">// and redirects), see Get, Post, and the Client type.</span>
<span class="token comment">//</span>
<span class="token comment">// Like the RoundTripper interface, the error types returned</span>
<span class="token comment">// by RoundTrip are unspecified.</span>
<span class="token keyword">func</span> <span class="token punctuation">(</span>t <span class="token operator">*</span>Transport<span class="token punctuation">)</span> <span class="token function">RoundTrip</span><span class="token punctuation">(</span>req <span class="token operator">*</span>Request<span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token operator">*</span>Response<span class="token punctuation">,</span> <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">return</span> t<span class="token punctuation">.</span><span class="token function">roundTrip</span><span class="token punctuation">(</span>req<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>继续</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token comment">// roundTrip implements a RoundTripper over HTTP.</span>
<span class="token keyword">func</span> <span class="token punctuation">(</span>t <span class="token operator">*</span>Transport<span class="token punctuation">)</span> <span class="token function">roundTrip</span><span class="token punctuation">(</span>req <span class="token operator">*</span>Request<span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token operator">*</span>Response<span class="token punctuation">,</span> <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	t<span class="token punctuation">.</span>nextProtoOnce<span class="token punctuation">.</span><span class="token function">Do</span><span class="token punctuation">(</span>t<span class="token punctuation">.</span>onceSetNextProtoDefaults<span class="token punctuation">)</span>
	ctx <span class="token operator">:=</span> req<span class="token punctuation">.</span><span class="token function">Context</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	trace <span class="token operator">:=</span> httptrace<span class="token punctuation">.</span><span class="token function">ContextClientTrace</span><span class="token punctuation">(</span>ctx<span class="token punctuation">)</span>

	<span class="token comment">// ...</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		<span class="token keyword">select</span> <span class="token punctuation">{</span>
		<span class="token keyword">case</span> <span class="token operator">&lt;-</span>ctx<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
			req<span class="token punctuation">.</span><span class="token function">closeBody</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
			<span class="token keyword">return</span> <span class="token boolean">nil</span><span class="token punctuation">,</span> ctx<span class="token punctuation">.</span><span class="token function">Err</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		<span class="token keyword">default</span><span class="token punctuation">:</span>
		<span class="token punctuation">}</span>

		<span class="token comment">// ...</span>

		<span class="token comment">// Get the cached or newly-created connection to either the</span>
		<span class="token comment">// host (for http or https), the http proxy, or the http proxy</span>
		<span class="token comment">// pre-CONNECTed to https server. In any case, we&#39;ll be ready</span>
		<span class="token comment">// to send it requests.</span>
		pconn<span class="token punctuation">,</span> err <span class="token operator">:=</span> t<span class="token punctuation">.</span><span class="token function">getConn</span><span class="token punctuation">(</span>treq<span class="token punctuation">,</span> cm<span class="token punctuation">)</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			t<span class="token punctuation">.</span><span class="token function">setReqCanceler</span><span class="token punctuation">(</span>cancelKey<span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">)</span>
			req<span class="token punctuation">.</span><span class="token function">closeBody</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
			<span class="token keyword">return</span> <span class="token boolean">nil</span><span class="token punctuation">,</span> err
		<span class="token punctuation">}</span>

		<span class="token keyword">var</span> resp <span class="token operator">*</span>Response
		<span class="token keyword">if</span> pconn<span class="token punctuation">.</span>alt <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			<span class="token comment">// HTTP/2 path.</span>
			t<span class="token punctuation">.</span><span class="token function">setReqCanceler</span><span class="token punctuation">(</span>cancelKey<span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">)</span> <span class="token comment">// not cancelable with CancelRequest</span>
			resp<span class="token punctuation">,</span> err <span class="token operator">=</span> pconn<span class="token punctuation">.</span>alt<span class="token punctuation">.</span><span class="token function">RoundTrip</span><span class="token punctuation">(</span>req<span class="token punctuation">)</span>
		<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
			resp<span class="token punctuation">,</span> err <span class="token operator">=</span> pconn<span class="token punctuation">.</span><span class="token function">roundTrip</span><span class="token punctuation">(</span>treq<span class="token punctuation">)</span>
		<span class="token punctuation">}</span>
		<span class="token keyword">if</span> err <span class="token operator">==</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			resp<span class="token punctuation">.</span>Request <span class="token operator">=</span> origReq
			<span class="token keyword">return</span> resp<span class="token punctuation">,</span> <span class="token boolean">nil</span>
		<span class="token punctuation">}</span>

		<span class="token comment">// ... </span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>重点是 <code>pconn, err := t.getConn(treq, cm)</code> 和 <code>resp, err = pconn.roundTrip(treq)</code>, 只走http/1.0 or http/1.1, 不走http/2.0 <s>其实出现conn也很接近了</s></p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token punctuation">(</span>pc <span class="token operator">*</span>persistConn<span class="token punctuation">)</span> <span class="token function">roundTrip</span><span class="token punctuation">(</span>req <span class="token operator">*</span>transportRequest<span class="token punctuation">)</span> <span class="token punctuation">(</span>resp <span class="token operator">*</span>Response<span class="token punctuation">,</span> err <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token function">testHookEnterRoundTrip</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	resc <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> responseAndError<span class="token punctuation">)</span>
	pc<span class="token punctuation">.</span>reqch <span class="token operator">&lt;-</span> requestAndChan<span class="token punctuation">{</span>
		req<span class="token punctuation">:</span>        req<span class="token punctuation">.</span>Request<span class="token punctuation">,</span>
		cancelKey<span class="token punctuation">:</span>  req<span class="token punctuation">.</span>cancelKey<span class="token punctuation">,</span>
		ch<span class="token punctuation">:</span>         resc<span class="token punctuation">,</span>
		addedGzip<span class="token punctuation">:</span>  requestedGzip<span class="token punctuation">,</span>
		continueCh<span class="token punctuation">:</span> continueCh<span class="token punctuation">,</span>
		callerGone<span class="token punctuation">:</span> gone<span class="token punctuation">,</span>
	<span class="token punctuation">}</span>

	<span class="token keyword">var</span> respHeaderTimer <span class="token operator">&lt;-</span><span class="token keyword">chan</span> time<span class="token punctuation">.</span>Time
	cancelChan <span class="token operator">:=</span> req<span class="token punctuation">.</span>Request<span class="token punctuation">.</span>Cancel
	ctxDoneChan <span class="token operator">:=</span> req<span class="token punctuation">.</span><span class="token function">Context</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	pcClosed <span class="token operator">:=</span> pc<span class="token punctuation">.</span>closech
	canceled <span class="token operator">:=</span> <span class="token boolean">false</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		<span class="token function">testHookWaitResLoop</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		<span class="token keyword">select</span> <span class="token punctuation">{</span>
		<span class="token keyword">case</span> err <span class="token operator">:=</span> <span class="token operator">&lt;-</span>writeErrCh<span class="token punctuation">:</span>
			<span class="token comment">// ...</span>
		<span class="token keyword">case</span> <span class="token operator">&lt;-</span>pcClosed<span class="token punctuation">:</span>
			<span class="token comment">// ...</span>
		<span class="token keyword">case</span> <span class="token operator">&lt;-</span>respHeaderTimer<span class="token punctuation">:</span>
			<span class="token comment">// ...</span>
		<span class="token keyword">case</span> re <span class="token operator">:=</span> <span class="token operator">&lt;-</span>resc<span class="token punctuation">:</span>
			<span class="token keyword">if</span> <span class="token punctuation">(</span>re<span class="token punctuation">.</span>res <span class="token operator">==</span> <span class="token boolean">nil</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token punctuation">(</span>re<span class="token punctuation">.</span>err <span class="token operator">==</span> <span class="token boolean">nil</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
				<span class="token function">panic</span><span class="token punctuation">(</span>fmt<span class="token punctuation">.</span><span class="token function">Sprintf</span><span class="token punctuation">(</span><span class="token string">&quot;internal error: exactly one of res or err should be set; nil=%v&quot;</span><span class="token punctuation">,</span> re<span class="token punctuation">.</span>res <span class="token operator">==</span> <span class="token boolean">nil</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
			<span class="token punctuation">}</span>
			<span class="token keyword">if</span> debugRoundTrip <span class="token punctuation">{</span>
				req<span class="token punctuation">.</span><span class="token function">logf</span><span class="token punctuation">(</span><span class="token string">&quot;resc recv: %p, %T/%#v&quot;</span><span class="token punctuation">,</span> re<span class="token punctuation">.</span>res<span class="token punctuation">,</span> re<span class="token punctuation">.</span>err<span class="token punctuation">,</span> re<span class="token punctuation">.</span>err<span class="token punctuation">)</span>
			<span class="token punctuation">}</span>
			<span class="token keyword">if</span> re<span class="token punctuation">.</span>err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
				<span class="token keyword">return</span> <span class="token boolean">nil</span><span class="token punctuation">,</span> pc<span class="token punctuation">.</span><span class="token function">mapRoundTripError</span><span class="token punctuation">(</span>req<span class="token punctuation">,</span> startBytesWritten<span class="token punctuation">,</span> re<span class="token punctuation">.</span>err<span class="token punctuation">)</span>
			<span class="token punctuation">}</span>
			<span class="token keyword">return</span> re<span class="token punctuation">.</span>res<span class="token punctuation">,</span> <span class="token boolean">nil</span>
		<span class="token keyword">case</span> <span class="token operator">&lt;-</span>cancelChan<span class="token punctuation">:</span>
			<span class="token comment">// ...</span>
		<span class="token keyword">case</span> <span class="token operator">&lt;-</span>ctxDoneChan<span class="token punctuation">:</span>
			<span class="token comment">// ...</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>重点是 <code>for</code> 中的 <code>case re:= &lt;- resc</code> , 如果没有报错并且,re.res是有数据的, 那么返回, 所以我们从找到是谁向resc发送的数据, 以及这个<code>resc</code> 这个通道中的数据是哪里来的呢? 注意到</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code>resc <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> responseAndError<span class="token punctuation">)</span>
	pc<span class="token punctuation">.</span>reqch <span class="token operator">&lt;-</span> requestAndChan<span class="token punctuation">{</span>
		req<span class="token punctuation">:</span>        req<span class="token punctuation">.</span>Request<span class="token punctuation">,</span>
		cancelKey<span class="token punctuation">:</span>  req<span class="token punctuation">.</span>cancelKey<span class="token punctuation">,</span>
		ch<span class="token punctuation">:</span>         resc<span class="token punctuation">,</span>
		addedGzip<span class="token punctuation">:</span>  requestedGzip<span class="token punctuation">,</span>
		continueCh<span class="token punctuation">:</span> continueCh<span class="token punctuation">,</span>
		callerGone<span class="token punctuation">:</span> gone<span class="token punctuation">,</span>
	<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里把<code>resc</code>这个channel传给了<code>pc(persistConnect)</code> 这个结构体中, 所以我们需要看看是哪个for中用到了这个channel, 继续, 我全文搜索了<code>reqch</code>, 然后在这个文件<code>net/http/transport.go</code>中找到了它</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token punctuation">(</span>pc <span class="token operator">*</span>persistConn<span class="token punctuation">)</span> <span class="token function">readLoop</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// ...</span>
	alive <span class="token operator">:=</span> <span class="token boolean">true</span>
	<span class="token keyword">for</span> alive <span class="token punctuation">{</span>
		pc<span class="token punctuation">.</span>readLimit <span class="token operator">=</span> pc<span class="token punctuation">.</span><span class="token function">maxHeaderResponseSize</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		<span class="token boolean">_</span><span class="token punctuation">,</span> err <span class="token operator">:=</span> pc<span class="token punctuation">.</span>br<span class="token punctuation">.</span><span class="token function">Peek</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>

		pc<span class="token punctuation">.</span>mu<span class="token punctuation">.</span><span class="token function">Lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		<span class="token keyword">if</span> pc<span class="token punctuation">.</span>numExpectedResponses <span class="token operator">==</span> <span class="token number">0</span> <span class="token punctuation">{</span>
			pc<span class="token punctuation">.</span><span class="token function">readLoopPeekFailLocked</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
			pc<span class="token punctuation">.</span>mu<span class="token punctuation">.</span><span class="token function">Unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
			<span class="token keyword">return</span>
		<span class="token punctuation">}</span>
		pc<span class="token punctuation">.</span>mu<span class="token punctuation">.</span><span class="token function">Unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

		rc <span class="token operator">:=</span> <span class="token operator">&lt;-</span>pc<span class="token punctuation">.</span>reqch
		trace <span class="token operator">:=</span> httptrace<span class="token punctuation">.</span><span class="token function">ContextClientTrace</span><span class="token punctuation">(</span>rc<span class="token punctuation">.</span>req<span class="token punctuation">.</span><span class="token function">Context</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>

		<span class="token keyword">var</span> resp <span class="token operator">*</span>Response
		<span class="token keyword">if</span> err <span class="token operator">==</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			resp<span class="token punctuation">,</span> err <span class="token operator">=</span> pc<span class="token punctuation">.</span><span class="token function">readResponse</span><span class="token punctuation">(</span>rc<span class="token punctuation">,</span> trace<span class="token punctuation">)</span>
		<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
			err <span class="token operator">=</span> transportReadFromServerError<span class="token punctuation">{</span>err<span class="token punctuation">}</span>
			closeErr <span class="token operator">=</span> err
		<span class="token punctuation">}</span>

		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			<span class="token keyword">if</span> pc<span class="token punctuation">.</span>readLimit <span class="token operator">&lt;=</span> <span class="token number">0</span> <span class="token punctuation">{</span>
				err <span class="token operator">=</span> fmt<span class="token punctuation">.</span><span class="token function">Errorf</span><span class="token punctuation">(</span><span class="token string">&quot;net/http: server response headers exceeded %d bytes; aborted&quot;</span><span class="token punctuation">,</span> pc<span class="token punctuation">.</span><span class="token function">maxHeaderResponseSize</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
			<span class="token punctuation">}</span>

			<span class="token keyword">select</span> <span class="token punctuation">{</span>
			<span class="token keyword">case</span> rc<span class="token punctuation">.</span>ch <span class="token operator">&lt;-</span> responseAndError<span class="token punctuation">{</span>err<span class="token punctuation">:</span> err<span class="token punctuation">}</span><span class="token punctuation">:</span>
			<span class="token keyword">case</span> <span class="token operator">&lt;-</span>rc<span class="token punctuation">.</span>callerGone<span class="token punctuation">:</span>
				<span class="token keyword">return</span>
			<span class="token punctuation">}</span>
			<span class="token keyword">return</span>
		<span class="token punctuation">}</span>
		pc<span class="token punctuation">.</span>readLimit <span class="token operator">=</span> maxInt64 <span class="token comment">// effectively no limit for response bodies</span>

		pc<span class="token punctuation">.</span>mu<span class="token punctuation">.</span><span class="token function">Lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		pc<span class="token punctuation">.</span>numExpectedResponses<span class="token operator">--</span>
		pc<span class="token punctuation">.</span>mu<span class="token punctuation">.</span><span class="token function">Unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

		bodyWritable <span class="token operator">:=</span> resp<span class="token punctuation">.</span><span class="token function">bodyIsWritable</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		hasBody <span class="token operator">:=</span> rc<span class="token punctuation">.</span>req<span class="token punctuation">.</span>Method <span class="token operator">!=</span> <span class="token string">&quot;HEAD&quot;</span> <span class="token operator">&amp;&amp;</span> resp<span class="token punctuation">.</span>ContentLength <span class="token operator">!=</span> <span class="token number">0</span>

		<span class="token keyword">if</span> resp<span class="token punctuation">.</span>Close <span class="token operator">||</span> rc<span class="token punctuation">.</span>req<span class="token punctuation">.</span>Close <span class="token operator">||</span> resp<span class="token punctuation">.</span>StatusCode <span class="token operator">&lt;=</span> <span class="token number">199</span> <span class="token operator">||</span> bodyWritable <span class="token punctuation">{</span>
			<span class="token comment">// Don&#39;t do keep-alive on error if either party requested a close</span>
			<span class="token comment">// or we get an unexpected informational (1xx) response.</span>
			<span class="token comment">// StatusCode 100 is already handled above.</span>
			alive <span class="token operator">=</span> <span class="token boolean">false</span>
		<span class="token punctuation">}</span>

		<span class="token keyword">if</span> <span class="token operator">!</span>hasBody <span class="token operator">||</span> bodyWritable <span class="token punctuation">{</span>
			replaced <span class="token operator">:=</span> pc<span class="token punctuation">.</span>t<span class="token punctuation">.</span><span class="token function">replaceReqCanceler</span><span class="token punctuation">(</span>rc<span class="token punctuation">.</span>cancelKey<span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">)</span>

			<span class="token comment">// Put the idle conn back into the pool before we send the response</span>
			<span class="token comment">// so if they process it quickly and make another request, they&#39;ll</span>
			<span class="token comment">// get this same conn. But we use the unbuffered channel &#39;rc&#39;</span>
			<span class="token comment">// to guarantee that persistConn.roundTrip got out of its select</span>
			<span class="token comment">// potentially waiting for this persistConn to close.</span>
			alive <span class="token operator">=</span> alive <span class="token operator">&amp;&amp;</span>
				<span class="token operator">!</span>pc<span class="token punctuation">.</span>sawEOF <span class="token operator">&amp;&amp;</span>
				pc<span class="token punctuation">.</span><span class="token function">wroteRequest</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span>
				replaced <span class="token operator">&amp;&amp;</span> <span class="token function">tryPutIdleConn</span><span class="token punctuation">(</span>trace<span class="token punctuation">)</span>

			<span class="token keyword">if</span> bodyWritable <span class="token punctuation">{</span>
				closeErr <span class="token operator">=</span> errCallerOwnsConn
			<span class="token punctuation">}</span>

			<span class="token keyword">select</span> <span class="token punctuation">{</span>
			<span class="token keyword">case</span> rc<span class="token punctuation">.</span>ch <span class="token operator">&lt;-</span> responseAndError<span class="token punctuation">{</span>res<span class="token punctuation">:</span> resp<span class="token punctuation">}</span><span class="token punctuation">:</span>
			<span class="token keyword">case</span> <span class="token operator">&lt;-</span>rc<span class="token punctuation">.</span>callerGone<span class="token punctuation">:</span>
				<span class="token keyword">return</span>
			<span class="token punctuation">}</span>

			<span class="token comment">// Now that they&#39;ve read from the unbuffered channel, they&#39;re safely</span>
			<span class="token comment">// out of the select that also waits on this goroutine to die, so</span>
			<span class="token comment">// we&#39;re allowed to exit now if needed (if alive is false)</span>
			<span class="token function">testHookReadLoopBeforeNextRead</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
			<span class="token keyword">continue</span>
		<span class="token punctuation">}</span>

		waitForBodyRead <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">bool</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span>
		body <span class="token operator">:=</span> <span class="token operator">&amp;</span>bodyEOFSignal<span class="token punctuation">{</span>
			body<span class="token punctuation">:</span> resp<span class="token punctuation">.</span>Body<span class="token punctuation">,</span>
			earlyCloseFn<span class="token punctuation">:</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token builtin">error</span> <span class="token punctuation">{</span>
				waitForBodyRead <span class="token operator">&lt;-</span> <span class="token boolean">false</span>
				<span class="token operator">&lt;-</span>eofc <span class="token comment">// will be closed by deferred call at the end of the function</span>
				<span class="token keyword">return</span> <span class="token boolean">nil</span>

			<span class="token punctuation">}</span><span class="token punctuation">,</span>
			fn<span class="token punctuation">:</span> <span class="token keyword">func</span><span class="token punctuation">(</span>err <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token builtin">error</span> <span class="token punctuation">{</span>
				isEOF <span class="token operator">:=</span> err <span class="token operator">==</span> io<span class="token punctuation">.</span>EOF
				waitForBodyRead <span class="token operator">&lt;-</span> isEOF
				<span class="token keyword">if</span> isEOF <span class="token punctuation">{</span>
					<span class="token operator">&lt;-</span>eofc <span class="token comment">// see comment above eofc declaration</span>
				<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
					<span class="token keyword">if</span> cerr <span class="token operator">:=</span> pc<span class="token punctuation">.</span><span class="token function">canceled</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> cerr <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
						<span class="token keyword">return</span> cerr
					<span class="token punctuation">}</span>
				<span class="token punctuation">}</span>
				<span class="token keyword">return</span> err
			<span class="token punctuation">}</span><span class="token punctuation">,</span>
		<span class="token punctuation">}</span>

		resp<span class="token punctuation">.</span>Body <span class="token operator">=</span> body
		<span class="token keyword">if</span> rc<span class="token punctuation">.</span>addedGzip <span class="token operator">&amp;&amp;</span> ascii<span class="token punctuation">.</span><span class="token function">EqualFold</span><span class="token punctuation">(</span>resp<span class="token punctuation">.</span>Header<span class="token punctuation">.</span><span class="token function">Get</span><span class="token punctuation">(</span><span class="token string">&quot;Content-Encoding&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token string">&quot;gzip&quot;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
			resp<span class="token punctuation">.</span>Body <span class="token operator">=</span> <span class="token operator">&amp;</span>gzipReader<span class="token punctuation">{</span>body<span class="token punctuation">:</span> body<span class="token punctuation">}</span>
			resp<span class="token punctuation">.</span>Header<span class="token punctuation">.</span><span class="token function">Del</span><span class="token punctuation">(</span><span class="token string">&quot;Content-Encoding&quot;</span><span class="token punctuation">)</span>
			resp<span class="token punctuation">.</span>Header<span class="token punctuation">.</span><span class="token function">Del</span><span class="token punctuation">(</span><span class="token string">&quot;Content-Length&quot;</span><span class="token punctuation">)</span>
			resp<span class="token punctuation">.</span>ContentLength <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1</span>
			resp<span class="token punctuation">.</span>Uncompressed <span class="token operator">=</span> <span class="token boolean">true</span>
		<span class="token punctuation">}</span>

		<span class="token keyword">select</span> <span class="token punctuation">{</span>
		<span class="token keyword">case</span> rc<span class="token punctuation">.</span>ch <span class="token operator">&lt;-</span> responseAndError<span class="token punctuation">{</span>res<span class="token punctuation">:</span> resp<span class="token punctuation">}</span><span class="token punctuation">:</span>
		<span class="token keyword">case</span> <span class="token operator">&lt;-</span>rc<span class="token punctuation">.</span>callerGone<span class="token punctuation">:</span>
			<span class="token keyword">return</span>
		<span class="token punctuation">}</span>

		<span class="token comment">// Before looping back to the top of this function and peeking on</span>
		<span class="token comment">// the bufio.Reader, wait for the caller goroutine to finish</span>
		<span class="token comment">// reading the response body. (or for cancellation or death)</span>
		<span class="token keyword">select</span> <span class="token punctuation">{</span>
		<span class="token keyword">case</span> bodyEOF <span class="token operator">:=</span> <span class="token operator">&lt;-</span>waitForBodyRead<span class="token punctuation">:</span>
			replaced <span class="token operator">:=</span> pc<span class="token punctuation">.</span>t<span class="token punctuation">.</span><span class="token function">replaceReqCanceler</span><span class="token punctuation">(</span>rc<span class="token punctuation">.</span>cancelKey<span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">)</span> <span class="token comment">// before pc might return to idle pool</span>
			alive <span class="token operator">=</span> alive <span class="token operator">&amp;&amp;</span>
				bodyEOF <span class="token operator">&amp;&amp;</span>
				<span class="token operator">!</span>pc<span class="token punctuation">.</span>sawEOF <span class="token operator">&amp;&amp;</span>
				pc<span class="token punctuation">.</span><span class="token function">wroteRequest</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span>
				replaced <span class="token operator">&amp;&amp;</span> <span class="token function">tryPutIdleConn</span><span class="token punctuation">(</span>trace<span class="token punctuation">)</span>
			<span class="token keyword">if</span> bodyEOF <span class="token punctuation">{</span>
				eofc <span class="token operator">&lt;-</span> <span class="token keyword">struct</span><span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">{</span><span class="token punctuation">}</span>
			<span class="token punctuation">}</span>
		<span class="token keyword">case</span> <span class="token operator">&lt;-</span>rc<span class="token punctuation">.</span>req<span class="token punctuation">.</span>Cancel<span class="token punctuation">:</span>
			alive <span class="token operator">=</span> <span class="token boolean">false</span>
			pc<span class="token punctuation">.</span>t<span class="token punctuation">.</span><span class="token function">CancelRequest</span><span class="token punctuation">(</span>rc<span class="token punctuation">.</span>req<span class="token punctuation">)</span>
		<span class="token keyword">case</span> <span class="token operator">&lt;-</span>rc<span class="token punctuation">.</span>req<span class="token punctuation">.</span><span class="token function">Context</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
			alive <span class="token operator">=</span> <span class="token boolean">false</span>
			pc<span class="token punctuation">.</span>t<span class="token punctuation">.</span><span class="token function">cancelRequest</span><span class="token punctuation">(</span>rc<span class="token punctuation">.</span>cancelKey<span class="token punctuation">,</span> rc<span class="token punctuation">.</span>req<span class="token punctuation">.</span><span class="token function">Context</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">Err</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
		<span class="token keyword">case</span> <span class="token operator">&lt;-</span>pc<span class="token punctuation">.</span>closech<span class="token punctuation">:</span>
			alive <span class="token operator">=</span> <span class="token boolean">false</span>
		<span class="token punctuation">}</span>

		<span class="token function">testHookReadLoopBeforeNextRead</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>是不是看起来很多? 但是我觉得最重要的部分是这里(好吧确实很多,后面发现了原来这里是不能减少的)</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token punctuation">(</span>pc <span class="token operator">*</span>persistConn<span class="token punctuation">)</span> <span class="token function">readLoop</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// ...</span>
	alive <span class="token operator">:=</span> <span class="token boolean">true</span>
	<span class="token keyword">for</span> alive <span class="token punctuation">{</span>
		<span class="token comment">// ...</span>
		rc <span class="token operator">:=</span> <span class="token operator">&lt;-</span>pc<span class="token punctuation">.</span>reqch
		trace <span class="token operator">:=</span> httptrace<span class="token punctuation">.</span><span class="token function">ContextClientTrace</span><span class="token punctuation">(</span>rc<span class="token punctuation">.</span>req<span class="token punctuation">.</span><span class="token function">Context</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>

		<span class="token keyword">var</span> resp <span class="token operator">*</span>Response
		<span class="token keyword">if</span> err <span class="token operator">==</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			resp<span class="token punctuation">,</span> err <span class="token operator">=</span> pc<span class="token punctuation">.</span><span class="token function">readResponse</span><span class="token punctuation">(</span>rc<span class="token punctuation">,</span> trace<span class="token punctuation">)</span>
		<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
			err <span class="token operator">=</span> transportReadFromServerError<span class="token punctuation">{</span>err<span class="token punctuation">}</span>
			closeErr <span class="token operator">=</span> err
		<span class="token punctuation">}</span>

		<span class="token comment">// ...</span>
		<span class="token keyword">select</span> <span class="token punctuation">{</span>
			<span class="token keyword">case</span> rc<span class="token punctuation">.</span>ch <span class="token operator">&lt;-</span> responseAndError<span class="token punctuation">{</span>res<span class="token punctuation">:</span> resp<span class="token punctuation">}</span><span class="token punctuation">:</span>
			<span class="token keyword">case</span> <span class="token operator">&lt;-</span>rc<span class="token punctuation">.</span>callerGone<span class="token punctuation">:</span>
				<span class="token keyword">return</span>
		<span class="token punctuation">}</span>
		<span class="token comment">// ...</span>

		bodyWritable <span class="token operator">:=</span> resp<span class="token punctuation">.</span><span class="token function">bodyIsWritable</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		hasBody <span class="token operator">:=</span> rc<span class="token punctuation">.</span>req<span class="token punctuation">.</span>Method <span class="token operator">!=</span> <span class="token string">&quot;HEAD&quot;</span> <span class="token operator">&amp;&amp;</span> resp<span class="token punctuation">.</span>ContentLength <span class="token operator">!=</span> <span class="token number">0</span>

		<span class="token keyword">if</span> resp<span class="token punctuation">.</span>Close <span class="token operator">||</span> rc<span class="token punctuation">.</span>req<span class="token punctuation">.</span>Close <span class="token operator">||</span> resp<span class="token punctuation">.</span>StatusCode <span class="token operator">&lt;=</span> <span class="token number">199</span> <span class="token operator">||</span> bodyWritable <span class="token punctuation">{</span>
			<span class="token comment">// Don&#39;t do keep-alive on error if either party requested a close</span>
			<span class="token comment">// or we get an unexpected informational (1xx) response.</span>
			<span class="token comment">// StatusCode 100 is already handled above.</span>
			alive <span class="token operator">=</span> <span class="token boolean">false</span>
		<span class="token punctuation">}</span>

		<span class="token keyword">if</span> <span class="token operator">!</span>hasBody <span class="token operator">||</span> bodyWritable <span class="token punctuation">{</span>
			replaced <span class="token operator">:=</span> pc<span class="token punctuation">.</span>t<span class="token punctuation">.</span><span class="token function">replaceReqCanceler</span><span class="token punctuation">(</span>rc<span class="token punctuation">.</span>cancelKey<span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">)</span>

			<span class="token comment">// Put the idle conn back into the pool before we send the response</span>
			<span class="token comment">// so if they process it quickly and make another request, they&#39;ll</span>
			<span class="token comment">// get this same conn. But we use the unbuffered channel &#39;rc&#39;</span>
			<span class="token comment">// to guarantee that persistConn.roundTrip got out of its select</span>
			<span class="token comment">// potentially waiting for this persistConn to close.</span>
			alive <span class="token operator">=</span> alive <span class="token operator">&amp;&amp;</span>
				<span class="token operator">!</span>pc<span class="token punctuation">.</span>sawEOF <span class="token operator">&amp;&amp;</span>
				pc<span class="token punctuation">.</span><span class="token function">wroteRequest</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span>
				replaced <span class="token operator">&amp;&amp;</span> <span class="token function">tryPutIdleConn</span><span class="token punctuation">(</span>trace<span class="token punctuation">)</span>

			<span class="token keyword">if</span> bodyWritable <span class="token punctuation">{</span>
				closeErr <span class="token operator">=</span> errCallerOwnsConn
			<span class="token punctuation">}</span>

			<span class="token keyword">select</span> <span class="token punctuation">{</span>
			<span class="token keyword">case</span> rc<span class="token punctuation">.</span>ch <span class="token operator">&lt;-</span> responseAndError<span class="token punctuation">{</span>res<span class="token punctuation">:</span> resp<span class="token punctuation">}</span><span class="token punctuation">:</span>
			<span class="token keyword">case</span> <span class="token operator">&lt;-</span>rc<span class="token punctuation">.</span>callerGone<span class="token punctuation">:</span>
				<span class="token keyword">return</span>
			<span class="token punctuation">}</span>

			<span class="token comment">// Now that they&#39;ve read from the unbuffered channel, they&#39;re safely</span>
			<span class="token comment">// out of the select that also waits on this goroutine to die, so</span>
			<span class="token comment">// we&#39;re allowed to exit now if needed (if alive is false)</span>
			<span class="token function">testHookReadLoopBeforeNextRead</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
			<span class="token keyword">continue</span>
		<span class="token punctuation">}</span>

		waitForBodyRead <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">bool</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span>
		body <span class="token operator">:=</span> <span class="token operator">&amp;</span>bodyEOFSignal<span class="token punctuation">{</span>
			body<span class="token punctuation">:</span> resp<span class="token punctuation">.</span>Body<span class="token punctuation">,</span>
			earlyCloseFn<span class="token punctuation">:</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token builtin">error</span> <span class="token punctuation">{</span>
				waitForBodyRead <span class="token operator">&lt;-</span> <span class="token boolean">false</span>
				<span class="token operator">&lt;-</span>eofc <span class="token comment">// will be closed by deferred call at the end of the function</span>
				<span class="token keyword">return</span> <span class="token boolean">nil</span>

			<span class="token punctuation">}</span><span class="token punctuation">,</span>
			fn<span class="token punctuation">:</span> <span class="token keyword">func</span><span class="token punctuation">(</span>err <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token builtin">error</span> <span class="token punctuation">{</span>
				isEOF <span class="token operator">:=</span> err <span class="token operator">==</span> io<span class="token punctuation">.</span>EOF
				waitForBodyRead <span class="token operator">&lt;-</span> isEOF
				<span class="token keyword">if</span> isEOF <span class="token punctuation">{</span>
					<span class="token operator">&lt;-</span>eofc <span class="token comment">// see comment above eofc declaration</span>
				<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
					<span class="token keyword">if</span> cerr <span class="token operator">:=</span> pc<span class="token punctuation">.</span><span class="token function">canceled</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> cerr <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
						<span class="token keyword">return</span> cerr
					<span class="token punctuation">}</span>
				<span class="token punctuation">}</span>
				<span class="token keyword">return</span> err
			<span class="token punctuation">}</span><span class="token punctuation">,</span>
		<span class="token punctuation">}</span>

		resp<span class="token punctuation">.</span>Body <span class="token operator">=</span> body
		<span class="token keyword">if</span> rc<span class="token punctuation">.</span>addedGzip <span class="token operator">&amp;&amp;</span> ascii<span class="token punctuation">.</span><span class="token function">EqualFold</span><span class="token punctuation">(</span>resp<span class="token punctuation">.</span>Header<span class="token punctuation">.</span><span class="token function">Get</span><span class="token punctuation">(</span><span class="token string">&quot;Content-Encoding&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token string">&quot;gzip&quot;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
			resp<span class="token punctuation">.</span>Body <span class="token operator">=</span> <span class="token operator">&amp;</span>gzipReader<span class="token punctuation">{</span>body<span class="token punctuation">:</span> body<span class="token punctuation">}</span>
			resp<span class="token punctuation">.</span>Header<span class="token punctuation">.</span><span class="token function">Del</span><span class="token punctuation">(</span><span class="token string">&quot;Content-Encoding&quot;</span><span class="token punctuation">)</span>
			resp<span class="token punctuation">.</span>Header<span class="token punctuation">.</span><span class="token function">Del</span><span class="token punctuation">(</span><span class="token string">&quot;Content-Length&quot;</span><span class="token punctuation">)</span>
			resp<span class="token punctuation">.</span>ContentLength <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1</span>
			resp<span class="token punctuation">.</span>Uncompressed <span class="token operator">=</span> <span class="token boolean">true</span>
		<span class="token punctuation">}</span>

		<span class="token keyword">select</span> <span class="token punctuation">{</span>
		<span class="token keyword">case</span> rc<span class="token punctuation">.</span>ch <span class="token operator">&lt;-</span> responseAndError<span class="token punctuation">{</span>res<span class="token punctuation">:</span> resp<span class="token punctuation">}</span><span class="token punctuation">:</span>
		<span class="token keyword">case</span> <span class="token operator">&lt;-</span>rc<span class="token punctuation">.</span>callerGone<span class="token punctuation">:</span>
			<span class="token keyword">return</span>
		<span class="token punctuation">}</span>

		<span class="token comment">// Before looping back to the top of this function and peeking on</span>
		<span class="token comment">// the bufio.Reader, wait for the caller goroutine to finish</span>
		<span class="token comment">// reading the response body. (or for cancellation or death)</span>
		<span class="token keyword">select</span> <span class="token punctuation">{</span>
		<span class="token keyword">case</span> bodyEOF <span class="token operator">:=</span> <span class="token operator">&lt;-</span>waitForBodyRead<span class="token punctuation">:</span>
			replaced <span class="token operator">:=</span> pc<span class="token punctuation">.</span>t<span class="token punctuation">.</span><span class="token function">replaceReqCanceler</span><span class="token punctuation">(</span>rc<span class="token punctuation">.</span>cancelKey<span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">)</span> <span class="token comment">// before pc might return to idle pool</span>
			alive <span class="token operator">=</span> alive <span class="token operator">&amp;&amp;</span>
				bodyEOF <span class="token operator">&amp;&amp;</span>
				<span class="token operator">!</span>pc<span class="token punctuation">.</span>sawEOF <span class="token operator">&amp;&amp;</span>
				pc<span class="token punctuation">.</span><span class="token function">wroteRequest</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span>
				replaced <span class="token operator">&amp;&amp;</span> <span class="token function">tryPutIdleConn</span><span class="token punctuation">(</span>trace<span class="token punctuation">)</span>
			<span class="token keyword">if</span> bodyEOF <span class="token punctuation">{</span>
				eofc <span class="token operator">&lt;-</span> <span class="token keyword">struct</span><span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">{</span><span class="token punctuation">}</span>
			<span class="token punctuation">}</span>
		<span class="token keyword">case</span> <span class="token operator">&lt;-</span>rc<span class="token punctuation">.</span>req<span class="token punctuation">.</span>Cancel<span class="token punctuation">:</span>
			alive <span class="token operator">=</span> <span class="token boolean">false</span>
			pc<span class="token punctuation">.</span>t<span class="token punctuation">.</span><span class="token function">CancelRequest</span><span class="token punctuation">(</span>rc<span class="token punctuation">.</span>req<span class="token punctuation">)</span>
		<span class="token keyword">case</span> <span class="token operator">&lt;-</span>rc<span class="token punctuation">.</span>req<span class="token punctuation">.</span><span class="token function">Context</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
			alive <span class="token operator">=</span> <span class="token boolean">false</span>
			pc<span class="token punctuation">.</span>t<span class="token punctuation">.</span><span class="token function">cancelRequest</span><span class="token punctuation">(</span>rc<span class="token punctuation">.</span>cancelKey<span class="token punctuation">,</span> rc<span class="token punctuation">.</span>req<span class="token punctuation">.</span><span class="token function">Context</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">Err</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
		<span class="token keyword">case</span> <span class="token operator">&lt;-</span>pc<span class="token punctuation">.</span>closech<span class="token punctuation">:</span>
			alive <span class="token operator">=</span> <span class="token boolean">false</span>
		<span class="token punctuation">}</span>


<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>总体看下来上面就是发现有<code>Get</code>请求过来, 然后<code>pc.reqch</code>收到了数据, 这个数据中又有回传回去的<code>rc.ch</code> 这个channel, 这个就是之前的 <code>resc</code> 这个channel, 那么我们看<code>pc.readResponse(rc. trace)</code>是怎么做的 注: 在后面的这一串是处理 body的读取的,前面header和首部的读取就是放在了<code>pc.readResponse(rc. trace)</code>这个里面</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token comment">// readResponse reads an HTTP response (or two, in the case of &quot;Expect:</span>
<span class="token comment">// 100-continue&quot;) from the server. It returns the final non-100 one.</span>
<span class="token comment">// trace is optional.</span>
<span class="token keyword">func</span> <span class="token punctuation">(</span>pc <span class="token operator">*</span>persistConn<span class="token punctuation">)</span> <span class="token function">readResponse</span><span class="token punctuation">(</span>rc requestAndChan<span class="token punctuation">,</span> trace <span class="token operator">*</span>httptrace<span class="token punctuation">.</span>ClientTrace<span class="token punctuation">)</span> <span class="token punctuation">(</span>resp <span class="token operator">*</span>Response<span class="token punctuation">,</span> err <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>

	<span class="token comment">// ...</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		resp<span class="token punctuation">,</span> err <span class="token operator">=</span> <span class="token function">ReadResponse</span><span class="token punctuation">(</span>pc<span class="token punctuation">.</span>br<span class="token punctuation">,</span> rc<span class="token punctuation">.</span>req<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	<span class="token comment">// ...</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>ok, 看<code>ReadResponse(pc.br, rc.req)</code>是做了什么</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token comment">// ReadResponse reads and returns an HTTP response from r.</span>
<span class="token comment">// The req parameter optionally specifies the Request that corresponds</span>
<span class="token comment">// to this Response. If nil, a GET request is assumed.</span>
<span class="token comment">// Clients must call resp.Body.Close when finished reading resp.Body.</span>
<span class="token comment">// After that call, clients can inspect resp.Trailer to find key/value</span>
<span class="token comment">// pairs included in the response trailer.</span>
<span class="token keyword">func</span> <span class="token function">ReadResponse</span><span class="token punctuation">(</span>r <span class="token operator">*</span>bufio<span class="token punctuation">.</span>Reader<span class="token punctuation">,</span> req <span class="token operator">*</span>Request<span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token operator">*</span>Response<span class="token punctuation">,</span> <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>

	tp <span class="token operator">:=</span> textproto<span class="token punctuation">.</span><span class="token function">NewReader</span><span class="token punctuation">(</span>r<span class="token punctuation">)</span>
	resp <span class="token operator">:=</span> <span class="token operator">&amp;</span>Response<span class="token punctuation">{</span>
		Request<span class="token punctuation">:</span> req<span class="token punctuation">,</span>
	<span class="token punctuation">}</span>
	<span class="token comment">// Parse the first line of the response.</span>
	line<span class="token punctuation">,</span> err <span class="token operator">:=</span> tp<span class="token punctuation">.</span><span class="token function">ReadLine</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token keyword">if</span> err <span class="token operator">==</span> io<span class="token punctuation">.</span>EOF <span class="token punctuation">{</span>
			err <span class="token operator">=</span> io<span class="token punctuation">.</span>ErrUnexpectedEOF
		<span class="token punctuation">}</span>
		<span class="token keyword">return</span> <span class="token boolean">nil</span><span class="token punctuation">,</span> err
	<span class="token punctuation">}</span>
	proto<span class="token punctuation">,</span> status<span class="token punctuation">,</span> ok <span class="token operator">:=</span> strings<span class="token punctuation">.</span><span class="token function">Cut</span><span class="token punctuation">(</span>line<span class="token punctuation">,</span> <span class="token string">&quot; &quot;</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> <span class="token operator">!</span>ok <span class="token punctuation">{</span>
		<span class="token keyword">return</span> <span class="token boolean">nil</span><span class="token punctuation">,</span> <span class="token function">badStringError</span><span class="token punctuation">(</span><span class="token string">&quot;malformed HTTP response&quot;</span><span class="token punctuation">,</span> line<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	resp<span class="token punctuation">.</span>Proto <span class="token operator">=</span> proto
	resp<span class="token punctuation">.</span>Status <span class="token operator">=</span> strings<span class="token punctuation">.</span><span class="token function">TrimLeft</span><span class="token punctuation">(</span>status<span class="token punctuation">,</span> <span class="token string">&quot; &quot;</span><span class="token punctuation">)</span>

	statusCode<span class="token punctuation">,</span> <span class="token boolean">_</span><span class="token punctuation">,</span> <span class="token boolean">_</span> <span class="token operator">:=</span> strings<span class="token punctuation">.</span><span class="token function">Cut</span><span class="token punctuation">(</span>resp<span class="token punctuation">.</span>Status<span class="token punctuation">,</span> <span class="token string">&quot; &quot;</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> <span class="token function">len</span><span class="token punctuation">(</span>statusCode<span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token number">3</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> <span class="token boolean">nil</span><span class="token punctuation">,</span> <span class="token function">badStringError</span><span class="token punctuation">(</span><span class="token string">&quot;malformed HTTP status code&quot;</span><span class="token punctuation">,</span> statusCode<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	resp<span class="token punctuation">.</span>StatusCode<span class="token punctuation">,</span> err <span class="token operator">=</span> strconv<span class="token punctuation">.</span><span class="token function">Atoi</span><span class="token punctuation">(</span>statusCode<span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token operator">||</span> resp<span class="token punctuation">.</span>StatusCode <span class="token operator">&lt;</span> <span class="token number">0</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> <span class="token boolean">nil</span><span class="token punctuation">,</span> <span class="token function">badStringError</span><span class="token punctuation">(</span><span class="token string">&quot;malformed HTTP status code&quot;</span><span class="token punctuation">,</span> statusCode<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">if</span> resp<span class="token punctuation">.</span>ProtoMajor<span class="token punctuation">,</span> resp<span class="token punctuation">.</span>ProtoMinor<span class="token punctuation">,</span> ok <span class="token operator">=</span> <span class="token function">ParseHTTPVersion</span><span class="token punctuation">(</span>resp<span class="token punctuation">.</span>Proto<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token operator">!</span>ok <span class="token punctuation">{</span>
		<span class="token keyword">return</span> <span class="token boolean">nil</span><span class="token punctuation">,</span> <span class="token function">badStringError</span><span class="token punctuation">(</span><span class="token string">&quot;malformed HTTP version&quot;</span><span class="token punctuation">,</span> resp<span class="token punctuation">.</span>Proto<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>

	<span class="token comment">// Parse the response headers.</span>
	mimeHeader<span class="token punctuation">,</span> err <span class="token operator">:=</span> tp<span class="token punctuation">.</span><span class="token function">ReadMIMEHeader</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token keyword">if</span> err <span class="token operator">==</span> io<span class="token punctuation">.</span>EOF <span class="token punctuation">{</span>
			err <span class="token operator">=</span> io<span class="token punctuation">.</span>ErrUnexpectedEOF
		<span class="token punctuation">}</span>
		<span class="token keyword">return</span> <span class="token boolean">nil</span><span class="token punctuation">,</span> err
	<span class="token punctuation">}</span>
	resp<span class="token punctuation">.</span>Header <span class="token operator">=</span> <span class="token function">Header</span><span class="token punctuation">(</span>mimeHeader<span class="token punctuation">)</span>

	<span class="token function">fixPragmaCacheControl</span><span class="token punctuation">(</span>resp<span class="token punctuation">.</span>Header<span class="token punctuation">)</span>

	err <span class="token operator">=</span> <span class="token function">readTransfer</span><span class="token punctuation">(</span>resp<span class="token punctuation">,</span> r<span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> <span class="token boolean">nil</span><span class="token punctuation">,</span> err
	<span class="token punctuation">}</span>

	<span class="token keyword">return</span> resp<span class="token punctuation">,</span> <span class="token boolean">nil</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中上面这一堆是做了首部和header的解析的, 重点是<code>func ReadResponse(r *bufio.Reader, req *Request) (*Response, error)</code> 中的<code>r *bufio.Reader</code> 从这个东西里面生成出<code>tp := textproto.NewReader(r)</code>, 然后是用<code>line, err := tp.ReadLine()</code>解析第一行的信息, 其中<code>ReadLine</code>这个函数是怎么实现从<code>bufio.Reader</code>的结构体中进行数据读取的, 这里就不做详细介绍, 因为这里这里都是实现的细节的问题了, 从这里找下去能够发现很多实现, 我这里想要着重描述的是为什么这个<code>r *bufio.Reader</code>就是能从tcp流中读出数据? 所以我们看看这个东西到底是怎么来的</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token punctuation">(</span>pc <span class="token operator">*</span>persistConn<span class="token punctuation">)</span> <span class="token function">readResponse</span><span class="token punctuation">(</span>rc requestAndChan<span class="token punctuation">,</span> trace <span class="token operator">*</span>httptrace<span class="token punctuation">.</span>ClientTrace<span class="token punctuation">)</span> <span class="token punctuation">(</span>resp <span class="token operator">*</span>Response<span class="token punctuation">,</span> err <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// ...</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		resp<span class="token punctuation">,</span> err <span class="token operator">=</span> <span class="token function">ReadResponse</span><span class="token punctuation">(</span>pc<span class="token punctuation">.</span>br<span class="token punctuation">,</span> rc<span class="token punctuation">.</span>req<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	<span class="token comment">// ...</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>之前的代码中这个的参数是<code>pc.br</code>,我们看看这个<code>pc</code>的结构体<code>persistConn</code>都有什么字段</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token comment">// persistConn wraps a connection, usually a persistent one</span>
<span class="token comment">// (but may be used for non-keep-alive requests as well)</span>
<span class="token keyword">type</span> persistConn <span class="token keyword">struct</span> <span class="token punctuation">{</span>
	<span class="token comment">// alt optionally specifies the TLS NextProto RoundTripper.</span>
	<span class="token comment">// This is used for HTTP/2 today and future protocols later.</span>
	<span class="token comment">// If it&#39;s non-nil, the rest of the fields are unused.</span>
	alt RoundTripper

	t         <span class="token operator">*</span>Transport
	cacheKey  connectMethodKey
	conn      net<span class="token punctuation">.</span>Conn
	tlsState  <span class="token operator">*</span>tls<span class="token punctuation">.</span>ConnectionState
	br        <span class="token operator">*</span>bufio<span class="token punctuation">.</span>Reader       <span class="token comment">// from conn</span>
	bw        <span class="token operator">*</span>bufio<span class="token punctuation">.</span>Writer       <span class="token comment">// to conn</span>
	nwrite    <span class="token builtin">int64</span>               <span class="token comment">// bytes written</span>
	reqch     <span class="token keyword">chan</span> requestAndChan <span class="token comment">// written by roundTrip; read by readLoop</span>
	writech   <span class="token keyword">chan</span> writeRequest   <span class="token comment">// written by roundTrip; read by writeLoop</span>
	closech   <span class="token keyword">chan</span> <span class="token keyword">struct</span><span class="token punctuation">{</span><span class="token punctuation">}</span>       <span class="token comment">// closed when conn closed</span>
	isProxy   <span class="token builtin">bool</span>
	sawEOF    <span class="token builtin">bool</span>  <span class="token comment">// whether we&#39;ve seen EOF from conn; owned by readLoop</span>
	readLimit <span class="token builtin">int64</span> <span class="token comment">// bytes allowed to be read; owned by readLoop</span>
	<span class="token comment">// writeErrCh passes the request write error (usually nil)</span>
	<span class="token comment">// from the writeLoop goroutine to the readLoop which passes</span>
	<span class="token comment">// it off to the res.Body reader, which then uses it to decide</span>
	<span class="token comment">// whether or not a connection can be reused. Issue 7569.</span>
	writeErrCh <span class="token keyword">chan</span> <span class="token builtin">error</span>

	writeLoopDone <span class="token keyword">chan</span> <span class="token keyword">struct</span><span class="token punctuation">{</span><span class="token punctuation">}</span> <span class="token comment">// closed when write loop ends</span>

	<span class="token comment">// Both guarded by Transport.idleMu:</span>
	idleAt    time<span class="token punctuation">.</span>Time   <span class="token comment">// time it last become idle</span>
	idleTimer <span class="token operator">*</span>time<span class="token punctuation">.</span>Timer <span class="token comment">// holding an AfterFunc to close it</span>

	mu                   sync<span class="token punctuation">.</span>Mutex <span class="token comment">// guards following fields</span>
	numExpectedResponses <span class="token builtin">int</span>
	closed               <span class="token builtin">error</span> <span class="token comment">// set non-nil when conn is closed, before closech is closed</span>
	canceledErr          <span class="token builtin">error</span> <span class="token comment">// set non-nil if conn is canceled</span>
	broken               <span class="token builtin">bool</span>  <span class="token comment">// an error has happened on this connection; marked broken so it&#39;s not reused.</span>
	reused               <span class="token builtin">bool</span>  <span class="token comment">// whether conn has had successful request/response and is being reused.</span>
	<span class="token comment">// mutateHeaderFunc is an optional func to modify extra</span>
	<span class="token comment">// headers on each outbound request before it&#39;s written. (the</span>
	<span class="token comment">// original Request given to RoundTrip is not modified)</span>
	mutateHeaderFunc <span class="token keyword">func</span><span class="token punctuation">(</span>Header<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们这边关注的就是<code>br *bufio.Reader // from conn</code>, 还有其中的<code>conn Net.Conn</code>这个到底是什么时候被赋值的? 或者说这个<code>pc</code>是在哪里被初始化的? 因为这个<code>pc</code>最开始是在<code>readLoop</code>这个函数中被执行的, 我们看看这个函数是在哪里被调用了</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token punctuation">(</span>t <span class="token operator">*</span>Transport<span class="token punctuation">)</span> <span class="token function">dialConn</span><span class="token punctuation">(</span>ctx context<span class="token punctuation">.</span>Context<span class="token punctuation">,</span> cm connectMethod<span class="token punctuation">)</span> <span class="token punctuation">(</span>pconn <span class="token operator">*</span>persistConn<span class="token punctuation">,</span> err <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>

	pconn <span class="token operator">=</span> <span class="token operator">&amp;</span>persistConn<span class="token punctuation">{</span>
		t<span class="token punctuation">:</span>             t<span class="token punctuation">,</span>
		cacheKey<span class="token punctuation">:</span>      cm<span class="token punctuation">.</span><span class="token function">key</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
		reqch<span class="token punctuation">:</span>         <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> requestAndChan<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
		writech<span class="token punctuation">:</span>       <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> writeRequest<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
		closech<span class="token punctuation">:</span>       <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token keyword">struct</span><span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
		writeErrCh<span class="token punctuation">:</span>    <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">error</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
		writeLoopDone<span class="token punctuation">:</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token keyword">struct</span><span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
	<span class="token punctuation">}</span>

	<span class="token comment">// ...</span>

	pconn<span class="token punctuation">.</span>br <span class="token operator">=</span> bufio<span class="token punctuation">.</span><span class="token function">NewReaderSize</span><span class="token punctuation">(</span>pconn<span class="token punctuation">,</span> t<span class="token punctuation">.</span><span class="token function">readBufferSize</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
	pconn<span class="token punctuation">.</span>bw <span class="token operator">=</span> bufio<span class="token punctuation">.</span><span class="token function">NewWriterSize</span><span class="token punctuation">(</span>persistConnWriter<span class="token punctuation">{</span>pconn<span class="token punctuation">}</span><span class="token punctuation">,</span> t<span class="token punctuation">.</span><span class="token function">writeBufferSize</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>

	<span class="token keyword">go</span> pconn<span class="token punctuation">.</span><span class="token function">readLoop</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> pconn<span class="token punctuation">.</span><span class="token function">writeLoop</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">return</span> pconn<span class="token punctuation">,</span> <span class="token boolean">nil</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>ok, 现在我们发现是这个函数<code>dialConn</code>进行的函数调用, 并且创建了pconn这个结构体, 那么看函数名dial这个就知道, 这个肯定是用来创建tcp连接的一个操作, 然后通过创建的tcp连接,socket的这个抽象, 然后通过这个来创建一个能够读取socket连接的一个操作, 然后获取到了连接之后创建两个goroutine, 用来监听请求, 因为之前就是<code>readLoop</code>这个函数在监听最顶层是<code>Get</code>函数调用的发过来的channel, 但是我们这里还发现了一些省略的东西就是真正的tcp连接</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token punctuation">(</span>t <span class="token operator">*</span>Transport<span class="token punctuation">)</span> <span class="token function">dialConn</span><span class="token punctuation">(</span>ctx context<span class="token punctuation">.</span>Context<span class="token punctuation">,</span> cm connectMethod<span class="token punctuation">)</span> <span class="token punctuation">(</span>pconn <span class="token operator">*</span>persistConn<span class="token punctuation">,</span> err <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// ...</span>
	conn<span class="token punctuation">,</span> err <span class="token operator">:=</span> t<span class="token punctuation">.</span><span class="token function">dial</span><span class="token punctuation">(</span>ctx<span class="token punctuation">,</span> <span class="token string">&quot;tcp&quot;</span><span class="token punctuation">,</span> cm<span class="token punctuation">.</span><span class="token function">addr</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
	pconn<span class="token punctuation">.</span>conn <span class="token operator">=</span> conn
	<span class="token comment">// ...</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中可以观察一下<code>conn</code>这个变量的结构体<code>net.Conn</code></p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token comment">// Conn is a generic stream-oriented network connection.</span>
<span class="token comment">//</span>
<span class="token comment">// Multiple goroutines may invoke methods on a Conn simultaneously.</span>
<span class="token keyword">type</span> Conn <span class="token keyword">interface</span> <span class="token punctuation">{</span>
	<span class="token comment">// Read reads data from the connection.</span>
	<span class="token comment">// Read can be made to time out and return an error after a fixed</span>
	<span class="token comment">// time limit; see SetDeadline and SetReadDeadline.</span>
	<span class="token function">Read</span><span class="token punctuation">(</span>b <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token builtin">byte</span><span class="token punctuation">)</span> <span class="token punctuation">(</span>n <span class="token builtin">int</span><span class="token punctuation">,</span> err <span class="token builtin">error</span><span class="token punctuation">)</span>

	<span class="token comment">// Write writes data to the connection.</span>
	<span class="token comment">// Write can be made to time out and return an error after a fixed</span>
	<span class="token comment">// time limit; see SetDeadline and SetWriteDeadline.</span>
	<span class="token function">Write</span><span class="token punctuation">(</span>b <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token builtin">byte</span><span class="token punctuation">)</span> <span class="token punctuation">(</span>n <span class="token builtin">int</span><span class="token punctuation">,</span> err <span class="token builtin">error</span><span class="token punctuation">)</span>

	<span class="token comment">// Close closes the connection.</span>
	<span class="token comment">// Any blocked Read or Write operations will be unblocked and return errors.</span>
	<span class="token function">Close</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token builtin">error</span>

	<span class="token comment">// LocalAddr returns the local network address, if known.</span>
	<span class="token function">LocalAddr</span><span class="token punctuation">(</span><span class="token punctuation">)</span> Addr

	<span class="token comment">// RemoteAddr returns the remote network address, if known.</span>
	<span class="token function">RemoteAddr</span><span class="token punctuation">(</span><span class="token punctuation">)</span> Addr

	<span class="token comment">// SetDeadline sets the read and write deadlines associated</span>
	<span class="token comment">// with the connection. It is equivalent to calling both</span>
	<span class="token comment">// SetReadDeadline and SetWriteDeadline.</span>
	<span class="token comment">//</span>
	<span class="token comment">// A deadline is an absolute time after which I/O operations</span>
	<span class="token comment">// fail instead of blocking. The deadline applies to all future</span>
	<span class="token comment">// and pending I/O, not just the immediately following call to</span>
	<span class="token comment">// Read or Write. After a deadline has been exceeded, the</span>
	<span class="token comment">// connection can be refreshed by setting a deadline in the future.</span>
	<span class="token comment">//</span>
	<span class="token comment">// If the deadline is exceeded a call to Read or Write or to other</span>
	<span class="token comment">// I/O methods will return an error that wraps os.ErrDeadlineExceeded.</span>
	<span class="token comment">// This can be tested using errors.Is(err, os.ErrDeadlineExceeded).</span>
	<span class="token comment">// The error&#39;s Timeout method will return true, but note that there</span>
	<span class="token comment">// are other possible errors for which the Timeout method will</span>
	<span class="token comment">// return true even if the deadline has not been exceeded.</span>
	<span class="token comment">//</span>
	<span class="token comment">// An idle timeout can be implemented by repeatedly extending</span>
	<span class="token comment">// the deadline after successful Read or Write calls.</span>
	<span class="token comment">//</span>
	<span class="token comment">// A zero value for t means I/O operations will not time out.</span>
	<span class="token function">SetDeadline</span><span class="token punctuation">(</span>t time<span class="token punctuation">.</span>Time<span class="token punctuation">)</span> <span class="token builtin">error</span>

	<span class="token comment">// SetReadDeadline sets the deadline for future Read calls</span>
	<span class="token comment">// and any currently-blocked Read call.</span>
	<span class="token comment">// A zero value for t means Read will not time out.</span>
	<span class="token function">SetReadDeadline</span><span class="token punctuation">(</span>t time<span class="token punctuation">.</span>Time<span class="token punctuation">)</span> <span class="token builtin">error</span>

	<span class="token comment">// SetWriteDeadline sets the deadline for future Write calls</span>
	<span class="token comment">// and any currently-blocked Write call.</span>
	<span class="token comment">// Even if write times out, it may return n &gt; 0, indicating that</span>
	<span class="token comment">// some of the data was successfully written.</span>
	<span class="token comment">// A zero value for t means Write will not time out.</span>
	<span class="token function">SetWriteDeadline</span><span class="token punctuation">(</span>t time<span class="token punctuation">.</span>Time<span class="token punctuation">)</span> <span class="token builtin">error</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们就选<code>Read([] byte) (int, error)</code>这个方法看一下具体实现吧</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">type</span> conn <span class="token keyword">struct</span> <span class="token punctuation">{</span>
	fd <span class="token operator">*</span>netFD
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token punctuation">(</span>c <span class="token operator">*</span>conn<span class="token punctuation">)</span> <span class="token function">ok</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token builtin">bool</span> <span class="token punctuation">{</span> <span class="token keyword">return</span> c <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token operator">&amp;&amp;</span> c<span class="token punctuation">.</span>fd <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">}</span>

<span class="token comment">// Implementation of the Conn interface.</span>

<span class="token comment">// Read implements the Conn Read method.</span>
<span class="token keyword">func</span> <span class="token punctuation">(</span>c <span class="token operator">*</span>conn<span class="token punctuation">)</span> <span class="token function">Read</span><span class="token punctuation">(</span>b <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token builtin">byte</span><span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token builtin">int</span><span class="token punctuation">,</span> <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">if</span> <span class="token operator">!</span>c<span class="token punctuation">.</span><span class="token function">ok</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">,</span> syscall<span class="token punctuation">.</span>EINVAL
	<span class="token punctuation">}</span>
	n<span class="token punctuation">,</span> err <span class="token operator">:=</span> c<span class="token punctuation">.</span>fd<span class="token punctuation">.</span><span class="token function">Read</span><span class="token punctuation">(</span>b<span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token operator">&amp;&amp;</span> err <span class="token operator">!=</span> io<span class="token punctuation">.</span>EOF <span class="token punctuation">{</span>
		err <span class="token operator">=</span> <span class="token operator">&amp;</span>OpError<span class="token punctuation">{</span>Op<span class="token punctuation">:</span> <span class="token string">&quot;read&quot;</span><span class="token punctuation">,</span> Net<span class="token punctuation">:</span> c<span class="token punctuation">.</span>fd<span class="token punctuation">.</span>net<span class="token punctuation">,</span> Source<span class="token punctuation">:</span> c<span class="token punctuation">.</span>fd<span class="token punctuation">.</span>laddr<span class="token punctuation">,</span> Addr<span class="token punctuation">:</span> c<span class="token punctuation">.</span>fd<span class="token punctuation">.</span>raddr<span class="token punctuation">,</span> Err<span class="token punctuation">:</span> err<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">return</span> n<span class="token punctuation">,</span> err
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中是很明显是能够看到这个是调用的操作系统的接口的, 因为涉及到了文件描述符了, 然后的话还想要看具体底层的实现就再看<code>c.fd.Read</code>函数了, 这里就不再展开说明了</p><p>前面讲到, 是<code>dialConn</code>这个函数产生的tcp连接以及<code>go pconn.readLoop()</code>这个函数, 但是这个和<code>Get</code>函数好像没关系啊, 不知道这个函数到底是什么时候调用的, 那么这个时候我们就要找依赖关系了, 看看<code>dialConn</code>这个函数是被谁调用的</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token comment">// dialConnFor dials on behalf of w and delivers the result to w.</span>
<span class="token comment">// dialConnFor has received permission to dial w.cm and is counted in t.connCount[w.cm.key()].</span>
<span class="token comment">// If the dial is canceled or unsuccessful, dialConnFor decrements t.connCount[w.cm.key()].</span>
<span class="token keyword">func</span> <span class="token punctuation">(</span>t <span class="token operator">*</span>Transport<span class="token punctuation">)</span> <span class="token function">dialConnFor</span><span class="token punctuation">(</span>w <span class="token operator">*</span>wantConn<span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// ...</span>
	pc<span class="token punctuation">,</span> err <span class="token operator">:=</span> t<span class="token punctuation">.</span><span class="token function">dialConn</span><span class="token punctuation">(</span>w<span class="token punctuation">.</span>ctx<span class="token punctuation">,</span> w<span class="token punctuation">.</span>cm<span class="token punctuation">)</span>
	<span class="token comment">// ...</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>继续找</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token comment">// queueForDial queues w to wait for permission to begin dialing.</span>
<span class="token comment">// Once w receives permission to dial, it will do so in a separate goroutine.</span>
<span class="token keyword">func</span> <span class="token punctuation">(</span>t <span class="token operator">*</span>Transport<span class="token punctuation">)</span> <span class="token function">queueForDial</span><span class="token punctuation">(</span>w <span class="token operator">*</span>wantConn<span class="token punctuation">)</span> <span class="token punctuation">{</span>
	w<span class="token punctuation">.</span><span class="token function">beforeDial</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> t<span class="token punctuation">.</span>MaxConnsPerHost <span class="token operator">&lt;=</span> <span class="token number">0</span> <span class="token punctuation">{</span>
		<span class="token keyword">go</span> t<span class="token punctuation">.</span><span class="token function">dialConnFor</span><span class="token punctuation">(</span>w<span class="token punctuation">)</span>
		<span class="token keyword">return</span>
	<span class="token punctuation">}</span>
	<span class="token comment">// ...</span>
	<span class="token keyword">if</span> n <span class="token operator">:=</span> t<span class="token punctuation">.</span>connsPerHost<span class="token punctuation">[</span>w<span class="token punctuation">.</span>key<span class="token punctuation">]</span><span class="token punctuation">;</span> n <span class="token operator">&lt;</span> t<span class="token punctuation">.</span>MaxConnsPerHost <span class="token punctuation">{</span>
		<span class="token comment">// ...</span>
		<span class="token keyword">go</span> t<span class="token punctuation">.</span><span class="token function">dialConnFor</span><span class="token punctuation">(</span>w<span class="token punctuation">)</span>
		<span class="token keyword">return</span>
	<span class="token punctuation">}</span>
	<span class="token comment">// ...</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>继续向上找</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token comment">// getConn dials and creates a new persistConn to the target as</span>
<span class="token comment">// specified in the connectMethod. This includes doing a proxy CONNECT</span>
<span class="token comment">// and/or setting up TLS.  If this doesn&#39;t return an error, the persistConn</span>
<span class="token comment">// is ready to write requests to.</span>
<span class="token keyword">func</span> <span class="token punctuation">(</span>t <span class="token operator">*</span>Transport<span class="token punctuation">)</span> <span class="token function">getConn</span><span class="token punctuation">(</span>treq <span class="token operator">*</span>transportRequest<span class="token punctuation">,</span> cm connectMethod<span class="token punctuation">)</span> <span class="token punctuation">(</span>pc <span class="token operator">*</span>persistConn<span class="token punctuation">,</span> err <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// ...</span>
	<span class="token comment">// Queue for permission to dial.</span>
	t<span class="token punctuation">.</span><span class="token function">queueForDial</span><span class="token punctuation">(</span>w<span class="token punctuation">)</span>
	<span class="token comment">// ...</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>真相大白了, 原来是在<code>getConn</code>的时候就已经创建了这个<code>pconn</code>与tcp连接了, 所以能够有一些这样的操作了</p><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结" aria-hidden="true">#</a> 总结</h2><p>这里算是看了一下go的<code>Get</code>请求是怎么发出来的吧, 以及在<code>read</code>的时候是做了一些怎么样的操作的, 其中重点分包的逻辑是在<code>readLoop</code>这个函数里面, 以及处理header的一些函数部分, 重点的逻辑还是要看源代码看http协议到底是怎么处理消息协议和分header, body以及怎么处理字节流的, 这里因为篇幅和时间关系重点讲解了一下<code>resp, err := http.Get()</code>这个resp到底是怎么产生出来的流程吧</p><blockquote><p>ps: 接下来可能会考虑开一个新坑就是net/http 中的ListenAndServe这个函数的流程拆解,因为之前也是了解过并且也看过别人的blog和go的源代码的, 但是也没有形成blog这种吧, 所有有时间考虑会写一下这个blog</p></blockquote><blockquote><p>彩蛋:找到的时候发现了TODO和对应的issues哈哈哈, 然后全局搜索了一下发现TODO和issues也蛮多的,咱就是说有时间把TODO都干掉可好?</p></blockquote><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token comment">// Read implements io.Reader.</span>
<span class="token keyword">func</span> <span class="token punctuation">(</span>fd <span class="token operator">*</span>FD<span class="token punctuation">)</span> <span class="token function">Read</span><span class="token punctuation">(</span>p <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token builtin">byte</span><span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token builtin">int</span><span class="token punctuation">,</span> <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">if</span> err <span class="token operator">:=</span> fd<span class="token punctuation">.</span><span class="token function">readLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">,</span> err
	<span class="token punctuation">}</span>
	<span class="token keyword">defer</span> fd<span class="token punctuation">.</span><span class="token function">readUnlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> <span class="token function">len</span><span class="token punctuation">(</span>p<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span> <span class="token punctuation">{</span>
		<span class="token comment">// If the caller wanted a zero byte read, return immediately</span>
		<span class="token comment">// without trying (but after acquiring the readLock).</span>
		<span class="token comment">// Otherwise syscall.Read returns 0, nil which looks like</span>
		<span class="token comment">// io.EOF.</span>
		<span class="token comment">// TODO(bradfitz): make it wait for readability? (Issue 15735)</span>
		<span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token boolean">nil</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">if</span> err <span class="token operator">:=</span> fd<span class="token punctuation">.</span>pd<span class="token punctuation">.</span><span class="token function">prepareRead</span><span class="token punctuation">(</span>fd<span class="token punctuation">.</span>isFile<span class="token punctuation">)</span><span class="token punctuation">;</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">,</span> err
	<span class="token punctuation">}</span>
	<span class="token keyword">if</span> fd<span class="token punctuation">.</span>IsStream <span class="token operator">&amp;&amp;</span> <span class="token function">len</span><span class="token punctuation">(</span>p<span class="token punctuation">)</span> <span class="token operator">&gt;</span> maxRW <span class="token punctuation">{</span>
		p <span class="token operator">=</span> p<span class="token punctuation">[</span><span class="token punctuation">:</span>maxRW<span class="token punctuation">]</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		n<span class="token punctuation">,</span> err <span class="token operator">:=</span> <span class="token function">ignoringEINTRIO</span><span class="token punctuation">(</span>syscall<span class="token punctuation">.</span>Read<span class="token punctuation">,</span> fd<span class="token punctuation">.</span>Sysfd<span class="token punctuation">,</span> p<span class="token punctuation">)</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			n <span class="token operator">=</span> <span class="token number">0</span>
			<span class="token keyword">if</span> err <span class="token operator">==</span> syscall<span class="token punctuation">.</span>EAGAIN <span class="token operator">&amp;&amp;</span> fd<span class="token punctuation">.</span>pd<span class="token punctuation">.</span><span class="token function">pollable</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
				<span class="token keyword">if</span> err <span class="token operator">=</span> fd<span class="token punctuation">.</span>pd<span class="token punctuation">.</span><span class="token function">waitRead</span><span class="token punctuation">(</span>fd<span class="token punctuation">.</span>isFile<span class="token punctuation">)</span><span class="token punctuation">;</span> err <span class="token operator">==</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
					<span class="token keyword">continue</span>
				<span class="token punctuation">}</span>
			<span class="token punctuation">}</span>
		<span class="token punctuation">}</span>
		err <span class="token operator">=</span> fd<span class="token punctuation">.</span><span class="token function">eofError</span><span class="token punctuation">(</span>n<span class="token punctuation">,</span> err<span class="token punctuation">)</span>
		<span class="token keyword">return</span> n<span class="token punctuation">,</span> err
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,51);function l(u,r){return s(),a("div",null,[c,t(" more "),i])}const k=n(o,[["render",l],["__file","net-http-get.html.vue"]]);export{k as default};
