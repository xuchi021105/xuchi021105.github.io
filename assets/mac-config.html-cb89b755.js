import{_ as p,W as e,X as t,Y as s,Z as i,a2 as a}from"./framework-eefab691.js";const c={},n=i("p",null,"百度实习mac电脑配置",-1),o=a("<p>yabai 类似i3wm和sway的tilling window manger skhd 配合yabai的键盘快捷键 sketchbar mac的状态栏, 这个支持和yabai兼容 其中yabai和skhd这个必须要文档支持, 因为这个还是有挺多坑的, 比如说要解除mac的完整性保护, 还有就是开机自动启动, 还有就是需要开启某个增强功能才可以, 这个必须找个时间干掉了去</p><p>context 算是一个增强的侧边栏了</p><p>alfred 这个是程序启动器加剪贴板管理器以及snippet这个东西, 还有就是要做到可以调出启动器之后，直接输入应用名字就可以切到对应的目录去，而不是打开一个新的应用，但是也可以选择打开一个新的应用，这个是要选择的，还有就是说要把在alfred设置的东西持久化保存下来，比如说这个的安装包，这个是一个付费软件</p><p>whatpulse 记录每天键盘打字次数次数以及监控进程使用时间和形成热力图的软件</p><p>karabiner-elements window中有autohot-key（应该是），这个是专门用来在软件层面做键盘映射的软件，这个有需要json做配置才能做的一些映射，这个也一定要以json文件的方式记录下来</p><p>orbstack 这个是mac下的一个类似docker和启动虚拟机的软件吧，这个能够以btrfs的方式来做一些挂载的操作，还是很强的（重点是btrfs很强）</p><p>arch.wiki 以后找linux就看这个学</p><p>rsync + fswatch(inoifty) 用rsync可以做到remote sync文件这种，算是另一种协议栈吧</p><p>fzf 模糊查找工具</p><p>lazygit</p><p>oh my fish 这个是用于管理fish的插件这种，能够做到插件管理，以及就是bobthefish这个主题（还有就是记住fish的一些语法和内置命令，比如fish-config能够打开一个web服务来配置</p><p>oh my zsh 以及插件，这个配置的话网上找教程就可以了</p><p>oh my tmux 这个是oh my tmux的github仓库调的一个好看的主题，很美观，然后就是我结合一个人的blog（春水煎茶）再修改结合了一下，这个的配置文件一定要留下来，传到github上面去</p><p>neofetch 这个neofetch是一个sh脚本，用env这个命令来找bash来执行的，这个我改了它sh脚本中的内容，因为这个如果想要用ansi转义序列显示像素图片的话，那么就要看这个的字符长度这种，重点看文档去，然后就是neofetch-theme这个主题，这个的配置文件记得存</p><p>viu 这个是能够显示像素也可以显示图片（如果终端支持的话）</p><p>kitty 可以配置也可以支持图片</p><p>alacritty 这个要把配置文件留下来并且上传</p><p>ranger 这个的配置文件也要留下来，这个和neofetch一样也是一个shell脚本这种，也是需要修改一下的</p><p>fish 这个的话必须要留下来对应的配置文件，这个是我做了修改的以及有一些额外的配置</p><p>nvim 这个记得上传配置文件到github上面去</p><p>lvim 一样，不过这个是由另一个插件管理器管理的，这个最重要的就是看lvim的官网，什么都有还有就是which-key这个的提示也非常重要</p><p>auditd 这个是用于监视进程是什么时候启动以及是什么时候进行系统调用的，mac下和linux下有所不一样，这个就是还欠着文档呢，类似的命令还有就是ptrace和strace吧，这个两个到时候也形成一下文档</p><p>dropbear 这个是一个轻量级的ssh工具，和open-ssh不一样</p><p>mycli 带补全的mysql client</p><p>iredis 也是一个带补全的redis client</p><p>redisInsight 昊推荐给我的一个redis 图形化客户端</p><p>rg,fd,lsd 不多说</p><p>输入法: 搜狗输入法我现在觉得挺好用的，百度输入法也还行，但是linux下肯定用fcitx，mac下用鼠须管(rime)</p><p>ncdu， 一个带tui的du dust，rust重写的一个du duf，rust重写的一个df</p><p>jetbrain的插件</p><p>vsc的插件</p><p>chrome的插件</p><p>snipaste 一个用于截图的软件，能够实现always on the top</p><p>w3m 一个终端浏览器</p><p>shotcut 一个视频剪辑工具</p><p>doubleCommander 这个是一个在mac下对finder的一个处理, 就是一个文件管理器吧</p><p>gimp 不必说</p><p>TODO 之后继续写</p>",38);function r(h,m){return e(),t("div",null,[n,s(" more "),o])}const l=p(c,[["render",r],["__file","mac-config.html.vue"]]);export{l as default};