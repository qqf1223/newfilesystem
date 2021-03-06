Ext.define('FS.view.project.PowerMenu',{
    extend:'Ext.menu.Menu',
    alias: 'widget.powermenu',
    initComponent: function(){
        Ext.apply(this,{
            float: true,
            xtype: 'menu',
            items:[]
        });
        this.callParent(arguments);

        //后端判断最好，先前端吧
        this.powermenu={
            "open":{
                text: '打开',
                ename: 'open',
                iconCls: 'icon-doc-open'
            },"alterfile":{
                text: '修改编号或名称',
                iconCls:'icon-edit',
                ename: 'alterfile'
            },"newdir":{
                text: '新建文件夹',
                iconCls:'icon-doc-new',
                ename: 'newdir'
            },"upload":{
                text:'上传文件',
                iconCls:'icon-doc-upload',
                ename: 'upload'
            },"del":{
                text:'删除',
                iconCls:'icon-doc-remove',
                ename: 'del'
            },"copystruct":{
                text: '复制文件夹结构',
                iconCls: 'icon-doc-open',
                ename: 'copystruct'
            },"addshare":{
                text: '设置共享',
                iconCls:'icon-share-doc-setting',
                ename: 'addshare'
            },"cannelshare":{
                text: '取消共享',
                iconCls:'icon-share-doc-setting',
                disabled: true,
                ename: 'cannelshare'
            },"history":{
                text:'历史版本',
                iconCls:'icon-doc-history',
                ename:'history'
            },"download":{
                text:'下载',
                iconCls:'icon-doc-download',
                ename:'download'
            },"powersetting":{
                text:'权限设置',
                iconCls:'icon-doc-setting',
                ename:'powersetting'
            },"refresh":{
                text: '刷新',
                iconCls: 'refresh',
                ename: 'refresh'
        }};
    },
    addMenuItem: function(isdir, isproject, obj, rcd){
        var fun=[];
        var treefun=[];
        if(obj=='powermenu'){
            if(isdir==1 && isproject==0){
                fun=['refresh', 'open']; 
            }
            else if(isdir==1){
                fun=['refresh','open', 'alterfile','newdir', 'upload', 'del','powersetting', 'addshare','cannelshare'];
                var regex_istree=/.*?Tree.*?/
                if(regex_istree.test(rcd.id)){
                    if(rcd.get('managerok')=='true'){
                        fun.push('copystruct');
                    }
                }
            }else{
                fun=['refresh', 'open', 'alterfile', 'del', 'download', 'history'];
            }
        }else if(obj=='gridmenu'){
            fun=['newdir', 'upload'];
        }
        this.addpower(fun, rcd);   
    },
    addpower: function(fun, rcd){
        this.removeAll();
        regex_istree=/.*?Tree.*?/
        if(rcd.get('fs_isdir')=='1' && regex_istree.test(rcd.id)){
            this.add(this.powermenu['refresh']);
        }
        if(fun.length>0){
            for(var i=0;i<fun.length; i++){
                if(login_user.u_grade>0){ 
                    if(fun[i]=='addshare' || fun[i]=='cannelshare'){
                        continue;
                    }
                }
                var fobidenfun=['alterfile', 'newdir', 'del', 'addshare', 'cannelshare', 'upload', 'copystruct', 'powersetting'];
                if(Ext.Array.contains(fobidenfun, fun[i])){
                    if(rcd.get('fs_is_share')=='1'){
                        if(rcd.get('fs_user')!=login_user.u_id && login_user.u_grade==0){
                            this.powermenu[fun[i]].disabled=true;
                        }else{
                            this.powermenu[fun[i]].disabled=false;
                        } 
                    }else{
                        if(rcd.get('fs_user')!=login_user.u_id && login_user.u_grade==0){
                            this.powermenu[fun[i]].disabled=true;
                        }
                    }
                }
                if(fun[i]=='cannelshare'){
                    if(rcd.get('fs_is_share')=='1'){
                        this.powermenu[fun[i]].disabled=false; 
                    }else{
                        this.powermenu[fun[i]].disabled=true;
                    }
                }

                if(this.verfiypower(fun[i])){
                    this.add(this.powermenu[fun[i]]);
                }
            } 
        }
    },
    verfiypower:function(p){
        //"adddocument","editdocument","readdocument","movedocument","deldocument","recoverdocument","readworkgroup","addworkgroup","editworkgroup","addgroupuser","delgroupuser","showgroupuser","uploadfile","downloadfile","updatefile","powersetting","readsyslog","readdoclog","lookuphistory","sharesetting","copydocumentstruct";
        var map={'refresh':'refresh', 'open':'readdocument', 'alterfile':'editdocument','newdir':'editdocument', 'upload':'uploadfile', 'del':'deldocument','powersetting':'powersetting', 'addshare':'sharesetting','cannelshare':'sharesetting','copystruct':'copydocumentstruct', 'history':'lookuphistory', 'download':'downloadfile'};
        for(var i in power){
            if(map[p]==power[i]){
                return true;
            }
        }
        return false;
    }
})
