import{_ as e,W as p,X as o,Y as c,Z as n,$ as s,a0 as t,a2 as l,C as i}from"./framework-eefab691.js";const u="/assets/matrix-285f47d2.gif",r={},d=n("p",null,"matrix",-1),k=n("h2",{id:"起因",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#起因","aria-hidden":"true"},"#"),s(" 起因")],-1),m=n("p",null,[s("之前看到大佬朋友在学awk,并且用awk在终端中实现了黑客帝国中的代码雨(大佬tql,%%%),感觉效果挺好看的,并且是在终端中实现,正好最近也在考虑用go语言写点啥"),n("s",null,"本来考虑用gin来写一个web后端,但是没想好具体写啥,还是等web课大作业题目出来后再说吧"),s(",所以想到用go语言也来实现一个matrix"),n("s",null,"才不是为了水篇博客呢")],-1),v=n("p",null,"效果演示如下图,感觉效果还不错",-1),b=n("figure",null,[n("img",{src:u,alt:"matrix",tabindex:"0",loading:"lazy"}),n("figcaption",null,"matrix")],-1),g={href:"https://github.com/GeertJohan/gomatrix",target:"_blank",rel:"noopener noreferrer"},h={href:"https://github.com/xuchi021105/go-matrix",target:"_blank",rel:"noopener noreferrer"},S=n("h2",{id:"gomatrix",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#gomatrix","aria-hidden":"true"},"#"),s(" gomatrix")],-1),y=n("h3",{id:"用到的第三方库",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#用到的第三方库","aria-hidden":"true"},"#"),s(" 用到的第三方库")],-1),f={href:"https://github.com/gdamore/tcell",target:"_blank",rel:"noopener noreferrer"},w=n("li",null,[s("用go-flags库来控制命令行参数"),n("s",null,"文章中没提到")],-1),x={href:"https://github.com/davecgh/go-spew",target:"_blank",rel:"noopener noreferrer"},C=n("s",null,"文章中没提到",-1),D=l(`<h3 id="思路和代码实现" tabindex="-1"><a class="header-anchor" href="#思路和代码实现" aria-hidden="true">#</a> 思路和代码实现</h3><p>给出Stream结构体的定义</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">type</span> Stream <span class="token keyword">struct</span> <span class="token punctuation">{</span>
	display  <span class="token operator">*</span>StreamDisplay 
	speed    <span class="token builtin">int</span>
	length   <span class="token builtin">int</span>
	headPos  <span class="token builtin">int</span>
	tailPos  <span class="token builtin">int</span>
	stopCh   <span class="token keyword">chan</span> <span class="token builtin">bool</span>
	headDone <span class="token builtin">bool</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>先只讨论在单列中让雨滴下落的方法,StreamDisplay和stopCh暂时我们不关心,后面会提到的 把雨滴抽象为Stream(data Stream),实现让Stream移动的方法是针对头部(headPos)和尾部(tailPos)进行处理,中间不动,类似一个队列(FIFO)的结构,把头部置为新生成的字符(利用tcell库提供的SetContent函数),然后自增(headPos++),尾部置为空格(相当于删去)然后自增(tailPos++),每次循环时都这样处理,就好像雨滴在下落一样,下面是这个思路的具体实现</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token punctuation">(</span>s <span class="token operator">*</span>Stream<span class="token punctuation">)</span> <span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	blackStyle <span class="token operator">:=</span> tcell<span class="token punctuation">.</span>StyleDefault<span class="token punctuation">.</span>
		<span class="token function">Foreground</span><span class="token punctuation">(</span>tcell<span class="token punctuation">.</span>ColorBlack<span class="token punctuation">)</span><span class="token punctuation">.</span>
		<span class="token function">Background</span><span class="token punctuation">(</span>tcell<span class="token punctuation">.</span>ColorBlack<span class="token punctuation">)</span>

	midStyleA <span class="token operator">:=</span> blackStyle<span class="token punctuation">.</span><span class="token function">Foreground</span><span class="token punctuation">(</span>tcell<span class="token punctuation">.</span>ColorGreen<span class="token punctuation">)</span>
	midStyleB <span class="token operator">:=</span> blackStyle<span class="token punctuation">.</span><span class="token function">Foreground</span><span class="token punctuation">(</span>tcell<span class="token punctuation">.</span>ColorLime<span class="token punctuation">)</span>
	headStyleA <span class="token operator">:=</span> blackStyle<span class="token punctuation">.</span><span class="token function">Foreground</span><span class="token punctuation">(</span>tcell<span class="token punctuation">.</span>ColorSilver<span class="token punctuation">)</span>
	headStyleB <span class="token operator">:=</span> blackStyle<span class="token punctuation">.</span><span class="token function">Foreground</span><span class="token punctuation">(</span>tcell<span class="token punctuation">.</span>ColorWhite<span class="token punctuation">)</span>

	<span class="token keyword">var</span> lastRune <span class="token builtin">rune</span>
STREAM<span class="token punctuation">:</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		<span class="token keyword">select</span> <span class="token punctuation">{</span>
		<span class="token operator">...</span>
		<span class="token keyword">case</span> <span class="token operator">&lt;-</span>time<span class="token punctuation">.</span><span class="token function">After</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span><span class="token function">Duration</span><span class="token punctuation">(</span>s<span class="token punctuation">.</span>speed<span class="token punctuation">)</span> <span class="token operator">*</span> time<span class="token punctuation">.</span>Millisecond<span class="token punctuation">)</span><span class="token punctuation">:</span>
			<span class="token comment">// add a new rune if there is space in the stream</span>
			<span class="token keyword">if</span> <span class="token operator">!</span>s<span class="token punctuation">.</span>headDone <span class="token operator">&amp;&amp;</span> s<span class="token punctuation">.</span>headPos <span class="token operator">&lt;=</span> curSizes<span class="token punctuation">.</span>height <span class="token punctuation">{</span>
				newRune <span class="token operator">:=</span> characters<span class="token punctuation">[</span>rand<span class="token punctuation">.</span><span class="token function">Intn</span><span class="token punctuation">(</span><span class="token function">len</span><span class="token punctuation">(</span>characters<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">]</span>

				<span class="token comment">// Making most of the green characters bright/bold...</span>
				<span class="token keyword">if</span> rand<span class="token punctuation">.</span><span class="token function">Intn</span><span class="token punctuation">(</span><span class="token number">100</span><span class="token punctuation">)</span> <span class="token operator">&lt;</span> <span class="token number">66</span> <span class="token punctuation">{</span>
					screen<span class="token punctuation">.</span><span class="token function">SetCell</span><span class="token punctuation">(</span>s<span class="token punctuation">.</span>display<span class="token punctuation">.</span>column<span class="token punctuation">,</span> s<span class="token punctuation">.</span>headPos<span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">,</span> midStyleA<span class="token punctuation">,</span> lastRune<span class="token punctuation">)</span>
				<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
					screen<span class="token punctuation">.</span><span class="token function">SetCell</span><span class="token punctuation">(</span>s<span class="token punctuation">.</span>display<span class="token punctuation">.</span>column<span class="token punctuation">,</span> s<span class="token punctuation">.</span>headPos<span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">,</span> midStyleB<span class="token punctuation">,</span> lastRune<span class="token punctuation">)</span>
				<span class="token punctuation">}</span>

				<span class="token comment">// ...and turning about a third of the heads from gray to white</span>
				<span class="token keyword">if</span> rand<span class="token punctuation">.</span><span class="token function">Intn</span><span class="token punctuation">(</span><span class="token number">100</span><span class="token punctuation">)</span> <span class="token operator">&lt;</span> <span class="token number">33</span> <span class="token punctuation">{</span>
					screen<span class="token punctuation">.</span><span class="token function">SetCell</span><span class="token punctuation">(</span>s<span class="token punctuation">.</span>display<span class="token punctuation">.</span>column<span class="token punctuation">,</span> s<span class="token punctuation">.</span>headPos<span class="token punctuation">,</span> headStyleA<span class="token punctuation">,</span> newRune<span class="token punctuation">)</span>
				<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
					screen<span class="token punctuation">.</span><span class="token function">SetCell</span><span class="token punctuation">(</span>s<span class="token punctuation">.</span>display<span class="token punctuation">.</span>column<span class="token punctuation">,</span> s<span class="token punctuation">.</span>headPos<span class="token punctuation">,</span> headStyleB<span class="token punctuation">,</span> newRune<span class="token punctuation">)</span>
				<span class="token punctuation">}</span>
				lastRune <span class="token operator">=</span> newRune
				s<span class="token punctuation">.</span>headPos<span class="token operator">++</span>
			<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
				s<span class="token punctuation">.</span>headDone <span class="token operator">=</span> <span class="token boolean">true</span>
			<span class="token punctuation">}</span>

			<span class="token comment">// clear rune at the tail of the stream</span>
			<span class="token keyword">if</span> s<span class="token punctuation">.</span>tailPos <span class="token operator">&gt;</span> <span class="token number">0</span> <span class="token operator">||</span> s<span class="token punctuation">.</span>headPos <span class="token operator">&gt;=</span> s<span class="token punctuation">.</span>length <span class="token punctuation">{</span>
				<span class="token operator">...</span>
				<span class="token keyword">if</span> s<span class="token punctuation">.</span>tailPos <span class="token operator">&lt;</span> curSizes<span class="token punctuation">.</span>height <span class="token punctuation">{</span>
					screen<span class="token punctuation">.</span><span class="token function">SetCell</span><span class="token punctuation">(</span>s<span class="token punctuation">.</span>display<span class="token punctuation">.</span>column<span class="token punctuation">,</span> s<span class="token punctuation">.</span>tailPos<span class="token punctuation">,</span> blackStyle<span class="token punctuation">,</span> <span class="token char">&#39; &#39;</span><span class="token punctuation">)</span> <span class="token comment">//&#39;\\uFF60&#39;</span>
					s<span class="token punctuation">.</span>tailPos<span class="token operator">++</span>
				<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
					<span class="token keyword">break</span> STREAM
				<span class="token punctuation">}</span>
			<span class="token punctuation">}</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>

	<span class="token operator">...</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><p>现在我们已经知道了怎样在单列中让雨滴下落移动,那么我们该怎么实现让雨滴在终端中不断移动呢?其中一个比较容易想到的思路就是把终端看成一个由列组成的数组,其中每一列都对应着一个Stream(列数组的数据类型是[]*Stream),用一个标志位exist来判断是否有Stream存在,初始的时候exist标志位都是false,然后开启一个goroutine来在列中生成Stream,生成后的exist值变为true,再开启一个goroutine用for循环来遍历这个列数组(集中控制管理和刷新),判断其中的标志位exist的值(其中是两个goroutine操纵同一个变量,得加上sync.Mutex),如果为true,利用Stream中的数据和前面提到的雨滴在单列中下落的方法,来实现在终端中(多列)雨滴下落的效果(这也是我实现的思路)</p><p>但是其中的问题有每次for循环都得遍历整个列数组(可以改进为用for循环遍历一个动态的slice,goroutine中生成的Stream用append函数加入其中,这样每次就只要遍历有数据的Stream了,而不用每次都要判断exist标志位),还有就是这样每列只能有一个Stream,必须等上一个Stream结束了才能产生新的Stream,一列同时不能有多个Stream(但是也可以改进,列数组中不存放*Stream,而是存放[]*Stream(列数组的数据类型改为[][]*Stream),每次循环时用[]*Stream中的数据刷新),而gomatrix中没有采用这种用一个goroutine来生成,另一个goroutine来控制终端刷新的办法,它其是通过开启很多个goroutine和使用channel来进行管理(个人认为开启太多goroutine好像没有必要,用一个goroutine就够了)</p><p>它的想法是不用开启一个for循环用于控制所有列中Stream的刷新,而是每个Stream的移动都有一个独立的goroutine控制,只需要控制该列就可以,(由于tcell中的SetContent函数执行后不会刷新终端,需要执行Sync函数或者Show函数才会刷新终端,这样还有一个好处就是可以实现不同的速度,当然在前面用for循环控制的情况下给Stream加个speed成员变量也可以,通过speed这个参数也可以+实现不同的下降速率),为了实现一个列中有多个Stream,每列用StreamDisplay(Stream管理器)来控制,其中用streams(map[*Stream]bool)来存储每个Stream,其中StreamDisplay也放在一个goroutine中用一个for循环,正常时候阻塞,当newStream通道有数据来的时候才执行创建Stream的goroutine,当Stream的全部从尾部出来时,向newStream通道传递信号,之后让StreamDisplay的goroutine随机等待一段时间再创建新的Stream放在streams中,然后开启一个新的控制Stream的goroutine,Stream的goroutine结束的时机是当Stream全部流出了终端,中止循环,然后用delete函数释放Streams中的*Stream</p><p>StreamDisplay结构体的定义</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">type</span> StreamDisplay <span class="token keyword">struct</span> <span class="token punctuation">{</span>
	column      <span class="token builtin">int</span>
	stopCh      <span class="token keyword">chan</span> <span class="token builtin">bool</span>
	streams     <span class="token keyword">map</span><span class="token punctuation">[</span><span class="token operator">*</span>Stream<span class="token punctuation">]</span><span class="token builtin">bool</span>
	streamsLock sync<span class="token punctuation">.</span>Mutex
	newStream   <span class="token keyword">chan</span> <span class="token builtin">bool</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>用newStream这个channel来控制StreamDisplay来生成新的Stream</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token punctuation">(</span>s <span class="token operator">*</span>Stream<span class="token punctuation">)</span> <span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	blackStyle <span class="token operator">:=</span> tcell<span class="token punctuation">.</span>StyleDefault<span class="token punctuation">.</span>
		<span class="token function">Foreground</span><span class="token punctuation">(</span>tcell<span class="token punctuation">.</span>ColorBlack<span class="token punctuation">)</span><span class="token punctuation">.</span>
		<span class="token function">Background</span><span class="token punctuation">(</span>tcell<span class="token punctuation">.</span>ColorBlack<span class="token punctuation">)</span>

	midStyleA <span class="token operator">:=</span> blackStyle<span class="token punctuation">.</span><span class="token function">Foreground</span><span class="token punctuation">(</span>tcell<span class="token punctuation">.</span>ColorGreen<span class="token punctuation">)</span>
	midStyleB <span class="token operator">:=</span> blackStyle<span class="token punctuation">.</span><span class="token function">Foreground</span><span class="token punctuation">(</span>tcell<span class="token punctuation">.</span>ColorLime<span class="token punctuation">)</span>
	headStyleA <span class="token operator">:=</span> blackStyle<span class="token punctuation">.</span><span class="token function">Foreground</span><span class="token punctuation">(</span>tcell<span class="token punctuation">.</span>ColorSilver<span class="token punctuation">)</span>
	headStyleB <span class="token operator">:=</span> blackStyle<span class="token punctuation">.</span><span class="token function">Foreground</span><span class="token punctuation">(</span>tcell<span class="token punctuation">.</span>ColorWhite<span class="token punctuation">)</span>

	<span class="token keyword">var</span> lastRune <span class="token builtin">rune</span>
STREAM<span class="token punctuation">:</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		<span class="token keyword">select</span> <span class="token punctuation">{</span>
		<span class="token operator">...</span>
        <span class="token keyword">case</span> <span class="token operator">&lt;-</span>time<span class="token punctuation">.</span><span class="token function">After</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span><span class="token function">Duration</span><span class="token punctuation">(</span>s<span class="token punctuation">.</span>speed<span class="token punctuation">)</span> <span class="token operator">*</span> time<span class="token punctuation">.</span>Millisecond<span class="token punctuation">)</span><span class="token punctuation">:</span>
        <span class="token operator">...</span>
        	<span class="token keyword">if</span> s<span class="token punctuation">.</span>tailPos <span class="token operator">&gt;</span> <span class="token number">0</span> <span class="token operator">||</span> s<span class="token punctuation">.</span>headPos <span class="token operator">&gt;=</span> s<span class="token punctuation">.</span>length <span class="token punctuation">{</span>
				<span class="token keyword">if</span> s<span class="token punctuation">.</span>tailPos <span class="token operator">==</span> <span class="token number">0</span> <span class="token punctuation">{</span>
					<span class="token comment">// tail is being incremented for the first time. there is space for a new stream</span>
					s<span class="token punctuation">.</span>display<span class="token punctuation">.</span>newStream <span class="token operator">&lt;-</span> <span class="token boolean">true</span>
				<span class="token punctuation">}</span>
                <span class="token operator">...</span>
            <span class="token punctuation">}</span>
        <span class="token operator">...</span>
            
	<span class="token punctuation">}</span>

	<span class="token function">delete</span><span class="token punctuation">(</span>s<span class="token punctuation">.</span>display<span class="token punctuation">.</span>streams<span class="token punctuation">,</span> s<span class="token punctuation">)</span> <span class="token comment">// 用于该Stream结束后删除map[*Stream]bool中的数据,释放内存</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>阻塞在newStream这个channel上,当有数据发送过来时,生成新的Stream并且开启一个新的协程来控制</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token punctuation">(</span>sd <span class="token operator">*</span>StreamDisplay<span class="token punctuation">)</span> <span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		<span class="token keyword">select</span> <span class="token punctuation">{</span>
		<span class="token operator">...</span>
		<span class="token keyword">case</span> <span class="token operator">&lt;-</span>sd<span class="token punctuation">.</span>newStream<span class="token punctuation">:</span>
			<span class="token comment">// have some wait before the first stream starts..</span>
			time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span><span class="token function">Duration</span><span class="token punctuation">(</span>rand<span class="token punctuation">.</span><span class="token function">Intn</span><span class="token punctuation">(</span><span class="token number">9000</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">*</span> time<span class="token punctuation">.</span>Millisecond<span class="token punctuation">)</span>

			<span class="token comment">// lock map</span>
			sd<span class="token punctuation">.</span>streamsLock<span class="token punctuation">.</span><span class="token function">Lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

			<span class="token comment">// create new stream instance</span>
			s <span class="token operator">:=</span> <span class="token operator">&amp;</span>Stream<span class="token punctuation">{</span>
				display<span class="token punctuation">:</span> sd<span class="token punctuation">,</span>
				stopCh<span class="token punctuation">:</span>  <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">bool</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
				speed<span class="token punctuation">:</span>   <span class="token number">30</span> <span class="token operator">+</span> rand<span class="token punctuation">.</span><span class="token function">Intn</span><span class="token punctuation">(</span><span class="token number">110</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
				length<span class="token punctuation">:</span>  <span class="token number">10</span> <span class="token operator">+</span> rand<span class="token punctuation">.</span><span class="token function">Intn</span><span class="token punctuation">(</span><span class="token number">8</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token comment">// length of a stream is between 10 and 18 runes</span>
			<span class="token punctuation">}</span>

			<span class="token comment">// store in streams map</span>
            sd<span class="token punctuation">.</span>streams<span class="token punctuation">[</span>s<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token boolean">true</span> <span class="token comment">// 和delete(s.display.streams, s)配套使用</span>

			<span class="token comment">// run the stream in a goroutine</span>
			<span class="token keyword">go</span> s<span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

			<span class="token comment">// unlock map</span>
			sd<span class="token punctuation">.</span>streamsLock<span class="token punctuation">.</span><span class="token function">Unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><p>前面说的StreamDisplay是管理一列所有的Stream的goroutine,又因为我们有很多列,所以要有一个StreamDisplay manager(StreamDisplay的管理器),用于管理每列的StreamDisplay(所以这其实是一个树形结构),又因为终端的大小会变化(行和列都会变化),所以在列变化的时候(行变化我们不考虑,因为这不涉及StreamDisplay的多少,其中行的值是动态变化的),我们需要考虑对StreamDisplay进行生成(列变多)和关闭(列变少),tcell中提供了ReSize事件,所以用sizesUpdateCh这个通道来通知窗口变化的事件,如果窗口的列变多了,那么就在map中增加空间(底层有内存扩容),如果列变少了,用delete函数来从map中删除数据,回收内存,当然删除的话没有这么简单,只删除StreamDisplay是不够的,StreamDisplay中还持有多个Stream以及相关的goroutine,所以在控制StreamDisplay的goroutine中也要通过channel来逐级回收</p><p>用map[int]*StreamDisplay来当列数组(用map来管理)</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token comment">// streamDisplays by column number</span>
<span class="token keyword">var</span> streamDisplaysByColumn <span class="token operator">=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">map</span><span class="token punctuation">[</span><span class="token builtin">int</span><span class="token punctuation">]</span><span class="token operator">*</span>StreamDisplay<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>StreamDisplay Manager</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token comment">// StreamDisplay manager</span>
	<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token keyword">var</span> lastWidth <span class="token builtin">int</span>

		<span class="token keyword">for</span> newSizes <span class="token operator">:=</span> <span class="token keyword">range</span> sizesUpdateCh <span class="token punctuation">{</span>
			log<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;New width: %d\\n&quot;</span><span class="token punctuation">,</span> newSizes<span class="token punctuation">.</span>width<span class="token punctuation">)</span>
			diffWidth <span class="token operator">:=</span> newSizes<span class="token punctuation">.</span>width <span class="token operator">-</span> lastWidth

			<span class="token keyword">if</span> diffWidth <span class="token operator">==</span> <span class="token number">0</span> <span class="token punctuation">{</span>
				<span class="token comment">// same column size, wait for new information</span>
				log<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;Got resize over channel, but diffWidth = 0&quot;</span><span class="token punctuation">)</span>
				<span class="token keyword">continue</span>
			<span class="token punctuation">}</span>

			<span class="token keyword">if</span> diffWidth <span class="token operator">&gt;</span> <span class="token number">0</span> <span class="token punctuation">{</span>
				log<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;Starting %d new SD&#39;s\\n&quot;</span><span class="token punctuation">,</span> diffWidth<span class="token punctuation">)</span>
				<span class="token keyword">for</span> newColumn <span class="token operator">:=</span> lastWidth<span class="token punctuation">;</span> newColumn <span class="token operator">&lt;</span> newSizes<span class="token punctuation">.</span>width<span class="token punctuation">;</span> newColumn<span class="token operator">++</span> <span class="token punctuation">{</span>
					<span class="token comment">// create stream display</span>
					sd <span class="token operator">:=</span> <span class="token operator">&amp;</span>StreamDisplay<span class="token punctuation">{</span>
						column<span class="token punctuation">:</span>    newColumn<span class="token punctuation">,</span>
						stopCh<span class="token punctuation">:</span>    <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">bool</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
						streams<span class="token punctuation">:</span>   <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">map</span><span class="token punctuation">[</span><span class="token operator">*</span>Stream<span class="token punctuation">]</span><span class="token builtin">bool</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
						newStream<span class="token punctuation">:</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">bool</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token comment">// will only be filled at start and when a spawning stream has it&#39;s tail released</span>
					<span class="token punctuation">}</span>
					streamDisplaysByColumn<span class="token punctuation">[</span>newColumn<span class="token punctuation">]</span> <span class="token operator">=</span> sd

					<span class="token comment">// start StreamDisplay in goroutine</span>
					<span class="token keyword">go</span> sd<span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

					<span class="token comment">// create first new stream</span>
					sd<span class="token punctuation">.</span>newStream <span class="token operator">&lt;-</span> <span class="token boolean">true</span>
				<span class="token punctuation">}</span>
				lastWidth <span class="token operator">=</span> newSizes<span class="token punctuation">.</span>width
			<span class="token punctuation">}</span>

			<span class="token keyword">if</span> diffWidth <span class="token operator">&lt;</span> <span class="token number">0</span> <span class="token punctuation">{</span>
				log<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;Closing %d SD&#39;s\\n&quot;</span><span class="token punctuation">,</span> diffWidth<span class="token punctuation">)</span>
				<span class="token keyword">for</span> closeColumn <span class="token operator">:=</span> lastWidth <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">;</span> closeColumn <span class="token operator">&gt;</span> newSizes<span class="token punctuation">.</span>width<span class="token punctuation">;</span> closeColumn<span class="token operator">--</span> <span class="token punctuation">{</span>
					<span class="token comment">// get sd</span>
					sd <span class="token operator">:=</span> streamDisplaysByColumn<span class="token punctuation">[</span>closeColumn<span class="token punctuation">]</span>

					<span class="token comment">// delete from map</span>
					<span class="token function">delete</span><span class="token punctuation">(</span>streamDisplaysByColumn<span class="token punctuation">,</span> closeColumn<span class="token punctuation">)</span>

					<span class="token comment">// inform sd that it&#39;s being closed</span>
					sd<span class="token punctuation">.</span>stopCh <span class="token operator">&lt;-</span> <span class="token boolean">true</span>
				<span class="token punctuation">}</span>
				lastWidth <span class="token operator">=</span> newSizes<span class="token punctuation">.</span>width
			<span class="token punctuation">}</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>StreamDisplay中用stopCh来停止的代码</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token punctuation">(</span>sd <span class="token operator">*</span>StreamDisplay<span class="token punctuation">)</span> <span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
        
		<span class="token keyword">select</span> <span class="token punctuation">{</span>
            
		<span class="token keyword">case</span> <span class="token operator">&lt;-</span>sd<span class="token punctuation">.</span>stopCh<span class="token punctuation">:</span>
			<span class="token comment">// lock this SD forever</span>
			sd<span class="token punctuation">.</span>streamsLock<span class="token punctuation">.</span><span class="token function">Lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

			<span class="token comment">// stop streams for this SD</span>
			<span class="token keyword">for</span> s <span class="token operator">:=</span> <span class="token keyword">range</span> sd<span class="token punctuation">.</span>streams <span class="token punctuation">{</span>
				s<span class="token punctuation">.</span>stopCh <span class="token operator">&lt;-</span> <span class="token boolean">true</span>
			<span class="token punctuation">}</span>

			<span class="token comment">// log that SD has closed</span>
			log<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;StreamDisplay on column %d stopped.\\n&quot;</span><span class="token punctuation">,</span> sd<span class="token punctuation">.</span>column<span class="token punctuation">)</span>

			<span class="token comment">// close this goroutine</span>
			<span class="token keyword">return</span>

		<span class="token operator">...</span>
            
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Stream中用StopCh来停止的代码</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token punctuation">(</span>s <span class="token operator">*</span>Stream<span class="token punctuation">)</span> <span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	blackStyle <span class="token operator">:=</span> tcell<span class="token punctuation">.</span>StyleDefault<span class="token punctuation">.</span>
		<span class="token function">Foreground</span><span class="token punctuation">(</span>tcell<span class="token punctuation">.</span>ColorBlack<span class="token punctuation">)</span><span class="token punctuation">.</span>
		<span class="token function">Background</span><span class="token punctuation">(</span>tcell<span class="token punctuation">.</span>ColorBlack<span class="token punctuation">)</span>

	midStyleA <span class="token operator">:=</span> blackStyle<span class="token punctuation">.</span><span class="token function">Foreground</span><span class="token punctuation">(</span>tcell<span class="token punctuation">.</span>ColorGreen<span class="token punctuation">)</span>
	midStyleB <span class="token operator">:=</span> blackStyle<span class="token punctuation">.</span><span class="token function">Foreground</span><span class="token punctuation">(</span>tcell<span class="token punctuation">.</span>ColorLime<span class="token punctuation">)</span>
	headStyleA <span class="token operator">:=</span> blackStyle<span class="token punctuation">.</span><span class="token function">Foreground</span><span class="token punctuation">(</span>tcell<span class="token punctuation">.</span>ColorSilver<span class="token punctuation">)</span>
	headStyleB <span class="token operator">:=</span> blackStyle<span class="token punctuation">.</span><span class="token function">Foreground</span><span class="token punctuation">(</span>tcell<span class="token punctuation">.</span>ColorWhite<span class="token punctuation">)</span>

	<span class="token keyword">var</span> lastRune <span class="token builtin">rune</span>
STREAM<span class="token punctuation">:</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		<span class="token keyword">select</span> <span class="token punctuation">{</span>
		<span class="token keyword">case</span> <span class="token operator">&lt;-</span>s<span class="token punctuation">.</span>stopCh<span class="token punctuation">:</span>
			log<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;Stream on SD %d was stopped.\\n&quot;</span><span class="token punctuation">,</span> s<span class="token punctuation">.</span>display<span class="token punctuation">.</span>column<span class="token punctuation">)</span>
			<span class="token keyword">break</span> STREAM
		<span class="token operator">...</span>
        	<span class="token punctuation">}</span>
        <span class="token punctuation">}</span>

	<span class="token function">delete</span><span class="token punctuation">(</span>s<span class="token punctuation">.</span>display<span class="token punctuation">.</span>streams<span class="token punctuation">,</span> s<span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>至此,实现matrix相关的代码逻辑就拆解完了,至于其中的通过命令行参数来实现不同效果,日志的打印,做性能的检测,检测操作系统的signal,和tcell的监听各种事件(键盘事件等)的代码读者有兴趣的话可以自己查看源代码,文章中就不再陈述了,下面来讲我自己实现的代码部分吧</p><h2 id="我的实现" tabindex="-1"><a class="header-anchor" href="#我的实现" aria-hidden="true">#</a> 我的实现</h2><h3 id="思路" tabindex="-1"><a class="header-anchor" href="#思路" aria-hidden="true">#</a> 思路</h3><p>思路已经在前面陈述过了,这里只说明一下具体实现</p><p>先初始化列切片,再开启三个goroutine,第一个goroutine用于遍历前面生成的列切片,判断exist标志位,如果为true则进行下落,如果为false则跳过该列,第二个goroutine用于每过一段时间在随机列中将exist位置为true,如果已经存在则重新生成,第三个goroutine则是处理窗口的Resize事件,通过channel来通信,平时是阻塞的的</p><h3 id="代码实现" tabindex="-1"><a class="header-anchor" href="#代码实现" aria-hidden="true">#</a> 代码实现</h3><p>Stream结构体的定义</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token comment">// Stream 用于控制每列的流</span>
<span class="token keyword">type</span> Stream <span class="token keyword">struct</span> <span class="token punctuation">{</span>
	col      <span class="token builtin">int</span>  <span class="token comment">// 列号</span>
	length   <span class="token builtin">int</span>  <span class="token comment">// 流的长度</span>
	headPos  <span class="token builtin">int</span>  <span class="token comment">// 头部的位置</span>
	headDone <span class="token builtin">bool</span> <span class="token comment">// 判断头部是否到底(这个参数没有也行,只是为了编程方便,即不需要再判断headPos是否大于height了,省的只判断headPos的值)</span>
	tailPos  <span class="token builtin">int</span>  <span class="token comment">// 尾部的位置</span>
	exist    <span class="token builtin">bool</span> <span class="token comment">// 是否存在这个流</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>SyncSlice结构体的定义,是加了同步的列切片</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token comment">// SyncSlice 包装了[]*Stream,其中sync.Mutex用于控制colStreams在数组扩容时不会发生内存泄露</span>
<span class="token keyword">type</span> SyncSlice <span class="token keyword">struct</span> <span class="token punctuation">{</span>
	mutex      sync<span class="token punctuation">.</span>Mutex <span class="token comment">// 信号量中的互斥量,mutex</span>
	colStreams <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token operator">*</span>Stream
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>初始化sync和sync中的colStreams</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code>sync <span class="token operator">:=</span> SyncSlice<span class="token punctuation">{</span>
	<span class="token comment">// 创建colStreams的slice,用于存储Stream的指针</span>
	colStreams<span class="token punctuation">:</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token operator">*</span>Stream<span class="token punctuation">,</span> curSize<span class="token punctuation">.</span>width<span class="token punctuation">)</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span>

<span class="token comment">// 初始化colStreams切片,exist为false表示为不存在</span>
<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> curSize<span class="token punctuation">.</span>width<span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
	sync<span class="token punctuation">.</span>colStreams<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token operator">&amp;</span>Stream<span class="token punctuation">{</span>
		exist<span class="token punctuation">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>第一个goroutine(用于遍历前面生成的列切片,判断exist标志位,如果为true则进行下落,如果为false则跳过该列)</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token comment">// 开启一个goroutine,用于让雨滴下落</span>
<span class="token comment">// 原理为模拟一个队列结构,储存headPos和tailPos</span>
<span class="token comment">// 其中headPos在每次刷新中自增,用SetContent和随机出的rune来填充这个值</span>
<span class="token comment">// 等headPos到底部了之后,设置headDone为true,不再刷新</span>
<span class="token comment">// tailPos的自增要等headPos的值大于length之后才开始</span>
<span class="token comment">// 将tailPos处的字符用SetContent函数置为&#39; &#39;空格这个空字符</span>
<span class="token comment">// 当tailPos到底部了之后,说明Stream已经结束了,将exist的值置为false,表示可以开启新的Stream</span>
<span class="token comment">//</span>
<span class="token comment">// 显示出下降的原理就是增加头部,中间不动,删去尾部,和我自己之前写的贪吃蛇运动的原理是一样的</span>
<span class="token comment">//</span>
<span class="token comment">// 这种用exist的方法实现起来比较简单,但是有个缺点就是一列同时只能存在一个Stream,不能有多个Stream</span>
<span class="token comment">// 但是我所参考的gomatrix是可以在一列中有多个Stream的,其原理是用协程来进行管理,有一个StreamDisplay,</span>
<span class="token comment">// StreamDisplay能对应n个Stream,用channel来进行信号的通知,一个Stream被一个StreamDisplay持有,</span>
<span class="token comment">// 一个StreamDisplay中持有n个Stream,最开始时初始化一个Stream,等到tailPos&gt;0(表示已经全部出来了)</span>
<span class="token comment">// 向StreamDisplay中的channel发送信号,StreamDisplay再进行创建新的Stream,要停止协程时,</span>
<span class="token comment">// 也是向Stream中控制停止的channel发送信号就可以停止,由于每个Stream是运行在</span>
<span class="token comment">// 一个单独的协程中的,不需要一个集中的manager来管理,只需要管理StreamDisplay就可以了,StreamDisplay能做到自动刷新界面</span>
<span class="token comment">// 所以能做到一列中有多个Stream,但是Stream因为速度不一样的原因,有重叠的可能性</span>
<span class="token comment">//</span>
<span class="token comment">// 由于我懒,所以只做了一个简单版本的,有兴趣的直接看gomatrix的源码吧,用channel用的很多</span>
<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		<span class="token comment">// screen.Show()中有锁,保证原子刷新</span>
		screen<span class="token punctuation">.</span><span class="token function">Show</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        
		<span class="token comment">//log.Println(&quot;render&quot;)</span>
		time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span>Millisecond <span class="token operator">*</span> time<span class="token punctuation">.</span><span class="token function">Duration</span><span class="token punctuation">(</span>downSpeed<span class="token punctuation">)</span><span class="token punctuation">)</span>
        
		sync<span class="token punctuation">.</span>mutex<span class="token punctuation">.</span><span class="token function">Lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		<span class="token comment">// curSize的值是动态变化的,每次会执行一个新的for循环</span>
		<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> curSize<span class="token punctuation">.</span>width<span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span> <span class="token comment">// for循环可以不用整个遍历的,遍历一个动态slice就可以,程序还有优化的地方,当然在生成Stream的协程中需要借助Set的帮助(去重),在blog提吧,程序中就不改了</span>
			stream <span class="token operator">:=</span> sync<span class="token punctuation">.</span>colStreams<span class="token punctuation">[</span>i<span class="token punctuation">]</span>
            <span class="token comment">// 判读是否存在Stream</span>
			<span class="token keyword">if</span> stream<span class="token punctuation">.</span>exist <span class="token punctuation">{</span>

				<span class="token comment">// 对头部的处理</span>
				<span class="token keyword">if</span> <span class="token operator">!</span>stream<span class="token punctuation">.</span>headDone <span class="token operator">&amp;&amp;</span> stream<span class="token punctuation">.</span>headPos <span class="token operator">&lt;=</span> curSize<span class="token punctuation">.</span>height <span class="token punctuation">{</span>
					newRune <span class="token operator">:=</span> charSet<span class="token punctuation">[</span>rand<span class="token punctuation">.</span><span class="token function">Intn</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span><span class="token punctuation">]</span>
					screen<span class="token punctuation">.</span><span class="token function">SetContent</span><span class="token punctuation">(</span>stream<span class="token punctuation">.</span>col<span class="token punctuation">,</span> stream<span class="token punctuation">.</span>headPos<span class="token punctuation">,</span> newRune<span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">,</span> greenStyle<span class="token punctuation">)</span>
					stream<span class="token punctuation">.</span>headPos<span class="token operator">++</span>
				<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
					stream<span class="token punctuation">.</span>headDone <span class="token operator">=</span> <span class="token boolean">true</span>
				<span class="token punctuation">}</span>

				<span class="token comment">// 对尾部的处理</span>
				<span class="token keyword">if</span> stream<span class="token punctuation">.</span>tailPos <span class="token operator">&gt;</span> <span class="token number">0</span> <span class="token operator">||</span> stream<span class="token punctuation">.</span>headPos <span class="token operator">&gt;=</span> stream<span class="token punctuation">.</span>length <span class="token punctuation">{</span>

					<span class="token keyword">if</span> stream<span class="token punctuation">.</span>tailPos <span class="token operator">&lt;</span> curSize<span class="token punctuation">.</span>height <span class="token punctuation">{</span>
						screen<span class="token punctuation">.</span><span class="token function">SetContent</span><span class="token punctuation">(</span>stream<span class="token punctuation">.</span>col<span class="token punctuation">,</span> stream<span class="token punctuation">.</span>tailPos<span class="token punctuation">,</span> <span class="token char">&#39; &#39;</span><span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">,</span> defStyle<span class="token punctuation">)</span>
						stream<span class="token punctuation">.</span>tailPos<span class="token operator">++</span>
					<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
						stream<span class="token punctuation">.</span>exist <span class="token operator">=</span> <span class="token boolean">false</span>
					<span class="token punctuation">}</span>
				<span class="token punctuation">}</span>
			<span class="token punctuation">}</span>
		<span class="token punctuation">}</span>
		sync<span class="token punctuation">.</span>mutex<span class="token punctuation">.</span><span class="token function">Unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>第二个goroutine(用于每过一段时间在随机列中将exist位置为true,如果已经存在则重新生成)</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token comment">// 开启一个goroutine,用于向colStreams中添加Stream,其中如果流已经存在,那么就再重新随机,其中要用锁变量(sync.Mutex)互斥量进行同步</span>
<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>

		time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span>Millisecond <span class="token operator">*</span> time<span class="token punctuation">.</span><span class="token function">Duration</span><span class="token punctuation">(</span>provideSpeed<span class="token punctuation">)</span><span class="token punctuation">)</span>
        
		randomInt <span class="token operator">:=</span> rand<span class="token punctuation">.</span><span class="token function">Intn</span><span class="token punctuation">(</span>curSize<span class="token punctuation">.</span>width<span class="token punctuation">)</span>

		<span class="token comment">//log.Println(&quot;generate random number:&quot;, randomInt)</span>

		sync<span class="token punctuation">.</span>mutex<span class="token punctuation">.</span><span class="token function">Lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		<span class="token keyword">if</span> sync<span class="token punctuation">.</span>colStreams<span class="token punctuation">[</span>randomInt<span class="token punctuation">]</span><span class="token punctuation">.</span>exist <span class="token punctuation">{</span>

		<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
			sync<span class="token punctuation">.</span>colStreams<span class="token punctuation">[</span>randomInt<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token operator">&amp;</span>Stream<span class="token punctuation">{</span>
				col<span class="token punctuation">:</span>      randomInt<span class="token punctuation">,</span>
				length<span class="token punctuation">:</span>   baseLength <span class="token operator">+</span> rand<span class="token punctuation">.</span><span class="token function">Intn</span><span class="token punctuation">(</span>randomLengthRange<span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token comment">// 随机长度</span>
				headPos<span class="token punctuation">:</span>  <span class="token number">0</span><span class="token punctuation">,</span>
				headDone<span class="token punctuation">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
				tailPos<span class="token punctuation">:</span>  <span class="token number">0</span><span class="token punctuation">,</span>
				exist<span class="token punctuation">:</span>    <span class="token boolean">true</span><span class="token punctuation">,</span>
			<span class="token punctuation">}</span>
		<span class="token punctuation">}</span>
		sync<span class="token punctuation">.</span>mutex<span class="token punctuation">.</span><span class="token function">Unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>第三个goroutine(处理窗口的Resize事件,通过channel来通信)</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token comment">// 此协程用于当ReSize事件触发时,将slice进行切片或者进行扩容</span>
<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>

	<span class="token comment">// 上一次的宽度</span>
	lastWidth <span class="token operator">:=</span> curSize<span class="token punctuation">.</span>width

	<span class="token comment">// 这里用for range来遍历一个channel,当channel中收到数据的时候,才执行,否则一直阻塞(有缓冲和无缓冲都可以用,效果都是等有数据进来就执行,没有就阻塞,有缓冲的相当于多了一个等待队列)</span>
	<span class="token comment">// 可以用for range,也可以用其他形式,比如select表达式来做,效果是一样的</span>
	<span class="token keyword">for</span> newSize <span class="token operator">:=</span> <span class="token keyword">range</span> sizeUpdateCh <span class="token punctuation">{</span>

		<span class="token comment">// 判断宽度时候变化</span>
		diffWidth <span class="token operator">:=</span> newSize<span class="token punctuation">.</span>width <span class="token operator">-</span> lastWidth
            
		<span class="token comment">// 宽度没变,不需要对slice进行调整</span>
		<span class="token keyword">if</span> diffWidth <span class="token operator">==</span> <span class="token number">0</span> <span class="token punctuation">{</span>
			<span class="token keyword">continue</span>
        <span class="token punctuation">}</span>

		<span class="token comment">// 宽度增加,进行扩容</span>
		<span class="token keyword">if</span> diffWidth <span class="token operator">&gt;</span> <span class="token number">0</span> <span class="token punctuation">{</span>
			<span class="token comment">// 加锁,防止在扩容的时候操作切片,不加锁可能导致内存泄漏(当然在低并发的条件下看不出来会泄漏,但是还是要加锁)</span>
			sync<span class="token punctuation">.</span>mutex<span class="token punctuation">.</span><span class="token function">Lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
			<span class="token comment">//log.Println(&quot;before allocate&quot;)</span>

			<span class="token comment">// go中的struct有默认值</span>
			<span class="token comment">// 创建要添加的Stream</span>
			newColStreams <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token operator">*</span>Stream<span class="token punctuation">,</span> diffWidth<span class="token punctuation">)</span>
			<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> diffWidth<span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
				newColStreams<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token operator">&amp;</span>Stream<span class="token punctuation">{</span>
					exist<span class="token punctuation">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
				<span class="token punctuation">}</span>
			<span class="token punctuation">}</span>
			<span class="token comment">// 进行扩容</span>
			sync<span class="token punctuation">.</span>colStreams <span class="token operator">=</span> <span class="token function">append</span><span class="token punctuation">(</span>sync<span class="token punctuation">.</span>colStreams<span class="token punctuation">,</span> newColStreams<span class="token operator">...</span><span class="token punctuation">)</span> <span class="token comment">// 针对slice的合并,需要用...语法来解包unpack</span>
			<span class="token comment">// 扩容完毕,释放锁</span>
			sync<span class="token punctuation">.</span>mutex<span class="token punctuation">.</span><span class="token function">Unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
			<span class="token comment">//log.Println(&quot;after allocate&quot;)</span>
		<span class="token punctuation">}</span>

		<span class="token comment">// 如果窗口缩小了,进行slice</span>
		<span class="token keyword">if</span> diffWidth <span class="token operator">&lt;</span> <span class="token number">0</span> <span class="token punctuation">{</span>
			sync<span class="token punctuation">.</span>mutex<span class="token punctuation">.</span><span class="token function">Lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
			<span class="token comment">// 进行切片操作</span>
			sync<span class="token punctuation">.</span>colStreams <span class="token operator">=</span> sync<span class="token punctuation">.</span>colStreams<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">:</span>newSize<span class="token punctuation">.</span>width<span class="token punctuation">]</span>
			sync<span class="token punctuation">.</span>mutex<span class="token punctuation">.</span><span class="token function">Unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		<span class="token punctuation">}</span>

	<span class="token punctuation">}</span>

<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>tcell的事件</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token comment">// 主线程中的事件循环</span>
<span class="token comment">// EVENTS是label标号,用于跳出外层循环的</span>
EVENTS<span class="token punctuation">:</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		<span class="token keyword">select</span> <span class="token punctuation">{</span>
		<span class="token comment">// tcell的事件</span>
		<span class="token keyword">case</span> event <span class="token operator">:=</span> <span class="token operator">&lt;-</span>eventChan<span class="token punctuation">:</span>
			<span class="token comment">// switch来判断事件的类型(和类型断言有点像)</span>
			<span class="token keyword">switch</span> ev <span class="token operator">:=</span> event<span class="token punctuation">.</span><span class="token punctuation">(</span><span class="token keyword">type</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
			<span class="token keyword">case</span> <span class="token operator">*</span>tcell<span class="token punctuation">.</span>EventKey<span class="token punctuation">:</span>
				<span class="token keyword">switch</span> ev<span class="token punctuation">.</span><span class="token function">Key</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
				<span class="token comment">// ctrl c的话,退出</span>
				<span class="token keyword">case</span> tcell<span class="token punctuation">.</span>KeyCtrlC<span class="token punctuation">:</span>
					<span class="token keyword">break</span> EVENTS
				<span class="token punctuation">}</span>

			<span class="token comment">// 如果是ReSize事件的话,向sizeUpdateCh发送cursize,进行更新</span>
			<span class="token keyword">case</span> <span class="token operator">*</span>tcell<span class="token punctuation">.</span>EventResize<span class="token punctuation">:</span>
				w<span class="token punctuation">,</span> h <span class="token operator">:=</span> ev<span class="token punctuation">.</span><span class="token function">Size</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
				curSize<span class="token punctuation">.</span><span class="token function">setSize</span><span class="token punctuation">(</span>w<span class="token punctuation">,</span> h<span class="token punctuation">)</span>
				sizeUpdateCh <span class="token operator">&lt;-</span> curSize <span class="token comment">// 这里用函数来做其实也可以,goroutine模型是用来做并发的,cpu密集型任务不能提高效率</span>
			<span class="token comment">// 报错处理</span>
			<span class="token keyword">case</span> <span class="token operator">*</span>tcell<span class="token punctuation">.</span>EventError<span class="token punctuation">:</span>
				log<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>ev<span class="token punctuation">.</span><span class="token function">Error</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
			<span class="token punctuation">}</span>
		<span class="token comment">// 操作系统的signal事件</span>
		<span class="token keyword">case</span> <span class="token operator">&lt;-</span>sigChan<span class="token punctuation">:</span>
			<span class="token comment">// 结束循环</span>
			<span class="token keyword">break</span> EVENTS
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="最后" tabindex="-1"><a class="header-anchor" href="#最后" aria-hidden="true">#</a> 最后</h2><p>写完这个matrix的实现花了3天多,主要是对go的语法其实不是很熟悉,而且之前对于channel和goroutine用的不多,总是理论多于实践,但是写完之后对于go的语法更加熟悉了, 并且知道了几个库的用法,还是挺有收获的<s>重点其实是水了篇博客</s>,这篇文章也就到这里结束啦,想要更多细节的话看源代码</p>`,47);function P(_,z){const a=i("ExternalLinkIcon");return p(),o("div",null,[d,c(" more "),k,m,v,b,n("p",null,[s("在网上找了找实现matrix的代码,在github上找到了"),n("a",g,[s("gomatrix"),t(a)]),s(",查看了源码之后,照着思路自己写了一下（"),n("a",h,[s("我的实现在这里"),t(a)]),s("),之后会介绍gomatrix实现的方法和我实现的方法")]),S,y,n("ul",null,[n("li",null,[s("使用了"),n("a",f,[s("tcell"),t(a)]),s("库来控制终端的输出(这个终端库可以监听终端上的键盘事件和鼠标事件等,类似gui库)")]),w,n("li",null,[n("a",x,[s("go-spew"),t(a)]),s("来进行输出调试(能够更具体的输出信息)"),C])]),D])}const B=e(r,[["render",P],["__file","go-matrix.html.vue"]]);export{B as default};
