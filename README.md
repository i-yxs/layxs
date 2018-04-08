弹出层(移动端)
===========================
(不依赖任何库，兼容主流浏览器)


效果图：
---------------------------
![](https://github.com/qq597392321/layxs/blob/master/demo/gif/1.gif) 


使用方法：
---------------------------
在页面中引用layxs-min.js <br>

```html
<script src="layxs-min.js"></script>
```
`注意layxs.css必须跟layxs-min.js在同一个目录`


文档：
---------------------------
### 模块

* #### 公共配置
```javascript
{
    //标题
    title: null,
    //内容（详见附录1）
    content: null,
    //背景
    boxback: '#fff',
    //圆角
    borderRadius: '8px',
    //显示的时间(number:毫秒|false:一直显示)
    duration: 0,
    //按钮列表 Array(string|number,...)
    button: null,
    //按钮事件列表 Array(function,...)
    btnEvent: null,
    //按钮排列方式 String('h'：横排 | 'v'：竖排)
    btnAlign: 'h',
    //显示区域（详见附录2）
    area: {},
    //内容是否可以滚动
    isScroll: false,
    //是否显示关闭按钮
    isCloseBtn: true,
    //是否显示遮罩层
    isMask: true,
    //遮罩层颜色
    maskColor: 'rgba(0,0,0,.6)',
    //点击遮罩层是否关闭消息框
    tapMaskClose: true,
    //父容器
    parentContainer: document.body,
    //显示时的过渡动画（详见附录4）
    tranIn: 'popup',
    //关闭时的过渡动画（详见附录4）
    tranOut: 'popup',
    //是否关闭其他弹框
    isCloseOther: false,
    //关闭后是否自动销毁对象
    isCloseAfteDestroy: true
}
```


* #### Msg (消息框)
```javascript
//例子
layxs.msg({
    text:'你好，欢迎使用 layxs '
});

//简易写法 参数：(文本)
layxs.msg('你好，欢迎使用 layxs ');
```
> ##### 特有参数
```javascript
{
    //文本
    text: '',
}
```


* #### Mask (遮罩层)
```javascript
//例子
layxs.mask({
    maskColor:'rgba(255, 0, 0, 0.5)'
});

//简易写法 参数：(遮罩层背景颜色)
layxs.mask('rgba(255, 0, 0, 0.5)');
```


* #### Tips (Tips)
```javascript
//例子
layxs.tips({
    text:'hello，我是Tips',
    duration:2000,
    direction:'top',
    adsorbElement:'DOM元素'
});

//简易写法 参数：(文本,吸附元素,方位,显示持续时间)
layxs.tips('hello，我是Tips', 'DOM元素', 'top', 2000);
```
> ##### 特有参数
```javascript
{
    //文本
    text: '',
    //显示方位（详见附录5）
    direction:'top',
    //吸附元素
    adsorbElement:'DOM元素'
}
```


* #### Open (弹出框)
```javascript
//例子
layxs.open({
    title:'标题',
    content:'内容'
});

//简易写法 参数：(内容,标题)
layxs.open('内容', '标题');
```


* #### Alert (提示框)
```javascript
//例子
layxs.alert({
    text:'你好，欢迎使用 layxs '
});

//简易写法 参数：(文本)
layxs.alert('你好，欢迎使用 layxs ');
```
> ##### 特有参数
```javascript
{
    //文本
    text: ''
}
```


* #### Prompt (输入框)
```javascript
//例子
layxs.prompt({
    text: '请输入您的邮箱地址',
    verify: function (val) {
        if (val!=='') {
            return true;
        }
        return '邮箱地址不能为空';
    },
    callback: function (name) {
        this.close();
        layxs.msg('你的邮箱地址：' + name);
    }
});

//简易写法 参数：(文本,回调函数)
layxs.prompt('请输入您的邮箱地址', function (val) {
    this.close();
    layxs.msg('你的邮箱地址：' + val);
});
```
> ##### 特有参数
```javascript
{
    //文本
    text: ''，
    //文本框内的描述文本
    placeholder: '',
    //回调函数
    callback: null,
    //自定义验证函数
    verify: null,
    //输入类型
    inputType: 'text'
}
```


* #### Confirm (询问框)
```javascript
//例子
layxs.alert({
    text:'请问你觉得 layxs 好用吗？',
    button: ['<font color="#999">不好用</font>', '好用'],
        this.close();
    }, function () {
        this.close();
    }
});

//简易写法 参数：(文本,选择"否"时的回调函数,选择"是"时的回调函数)
layxs.confirm('请问你觉得 layxs 好用吗？',function () {
    this.close();
}, function () {
    this.close();
});
```
> ##### 特有参数
```javascript
{
    //文本
    text: ''
}
```


* #### Loading (加载提示)
```javascript
//例子
layxs.loading({
    text:'加载中...'
});

//简易写法 参数：(文本)
layxs.loading('加载中...');
```
> ##### 特有参数
```javascript
{
    //文本
    text: ''
}
```


### 方法

* #### close (关闭所有或指定id的弹框)
```javascript
//参数：(弹出层id不填则关闭所有弹出层)
layxs.close();
```

* #### config (设置默认配置)
```javascript
//参数：(模块名称,配置对象)
layxs.config('msg', {
    text: 'Msg默认文本'
});
```

### 附录

* #### 附录1
> `content` 用于设置弹出层的内容，可以为任何数据，当设置为DOM对象时，会把该DOM对象删除并保存，然后显示在弹出层内，关闭后还原 <br>
> `仅适用于open`


* #### 附录2
> `area` 用于设置弹出层的显示区域 类型：Object
```javascript
//例子
layxs.open({
    area:{
        v:'',
        h:'',
        width:'',
        height:'',
        minWidth:'',
        minHeight:'',
        maxWidth:'',
        maxHeight:''
    }
});

//参数列表
/* 
    v:垂直坐标位置 类型：Object
    
        number:     数字
        'n%':       相对于屏幕高度的百分比
        'top':      显示在屏幕最顶端
        'bottom':   显示在屏幕最底端
        'centre':   居中显示(默认)
        'calc()'    计算(详见附录3)
        
    h:水平坐标位置 类型：Object
    
        number:     数字
        'n%':       相对于屏幕宽度的百分比
        'top':      显示在屏幕最左端
        'bottom':   显示在屏幕最右端
        'centre':   居中显示(默认)
        'calc()'    计算(详见附录3)
        
    width:宽度 类型：Object
    
        number:     数字
        'n%':       相对于屏幕宽度的百分比
        'full':     铺满屏幕
        'calc()'    计算(详见附录3)
        
    height:高度 类型：Object
    
        number:     数字
        'n%':       相对于屏幕高度的百分比
        'full':     铺满屏幕
        'calc()'    计算(详见附录3)
        
    minWidth:最小宽度 类型：Object
    
        number:     数字
        'n%':       相对于屏幕宽度的百分比
        'calc()'    计算(详见附录3)
        
    minHeight:最小高度 类型：Object
    
        number:     数字
        'n%':       相对于屏幕高度的百分比
        'calc()'    计算(详见附录3)
        
    maxWidth:最大宽度 类型：Object
    
        number:     数字
        'n%':       相对于屏幕宽度的百分比
        'calc()'    计算(详见附录3)
        
    maxHeight:最大高度 类型：Object
    
        number:     数字
        'n%':       相对于屏幕高度的百分比
        'calc()'    计算(详见附录3)
        
*/

```

* #### 附录3
> `calc` 用于解析字符串算式并计算，还可以组合内置的关键词
```javascript
//例子
layxs.msg({
    area:{
        width:'calc(vw-100)',
    }
});
//翻译：设置msg弹出框的宽度为当前屏幕宽度-100

//关键词列表
/*
    'vw'        屏幕宽度
    'vh'        屏幕高度
    'bw'        弹出框宽度(仅h v可用)
    'bh'        弹出框高度(仅h v可用)
    'left'      屏幕最左端(仅h可用)
    'right'     屏幕最右端(仅h可用)
    'top'       屏幕最顶端(仅v可用)
    'bottom'    屏幕最底端(仅v可用)
*/
```

* #### 附录4
> `tranIn` `tranOut` 用于设置弹出层显示和关闭的过渡动画效果 <br>
```javascript
//例子
layxs.msg({
    tranIn:'popup',
    tranOut:'popup',
});

//动画效果列表
/*
    'popup'                  默认效果
    'left_rihgt_slide'       从左往右滑入
    'rihgt_left_slide'       从右往左滑入
    'top_bottom_slide'       从上往下滑入
    'bottom_top_slide'       从下往上滑入
*/
```

* #### 附录5
> `direction` 用于设置Tips弹出层的显示方位 <br>
> 如果指定方向无法显示完整，则按照top right bottom left顺序依次计算，如果没有一个方向能显示完整，则使用指定方向显示
