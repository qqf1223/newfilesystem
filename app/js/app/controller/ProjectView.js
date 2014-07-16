Ext.define('FS.controller.ProjectView', {
    extend: 'Ext.app.Controller',
    stores: [
    'List',
    'Tree',
    'HistoryList',
    'ParentRecord',
    'FileUpload'
    ],
    views:[
    'project.List',
    'project.PowerMenu',
    'project.HistoryList',
    'swfupload.UploadPanel',
    'swfupload.DragUploadPanel',        
    'project.PowerSetting',
    'project.ProjectView',        
    'project.Tree'        
    ],
    refs:[{
        ref: 'projectTree',
        selector: 'projectTreeList'
    }],
    /*
    views:[       
    'project.ProjectView'
    ],

    requires: [
    'FS.controller.Project',
    'FS.controller.ProjectTree'
    ],*/
    init: function(){
        this.control({
            'projectTreeList':{
                //文件夹树单击事件
                itemclick : function(){new Ext.util.DelayedTask().delay(1500, this.delayitemclick, this, [arguments,'click']);}, 
                itemdblclick : function(){new Ext.util.DelayedTask().delay(500, this.delayitemclick, this, [arguments,'dbclick']);},
                beforeitemexpand: this.beforeitemexpand,
                itemcollapse: this.itemcollapse,
                //文件夹数右键事件
                itemcontextmenu : this.powermenufun,
                beforeitemmove:function(node, oldParent, newParent, index, eOpts){
                    if(Ext.isEmpty(newParent) || newParent.get('id')=='root' || newParent.raw.fs_isdir=='0'){
                        Ext.Msg.alert('提示', '目标文件夹错误， 请重现选择');
                        return false;
                    }
                    Ext.Msg.show({  
                        title:'提示',
                        closable: false, 
                        msg:'确定移动'+node.get('text')+' 到 '+newParent.get('text')+'下吗？', 
                        icon:Ext.MessageBox.QUESTION,
                        buttons: Ext.Msg.YESNO,
                        fn: function(btn){
                            if(btn=='yes'){
                                dragtreepaneldata(node, oldParent, newParent);
                            }
                            return false;
                        } 
                    });
                    return false;
                }

            },
            'projectList': {
                containercontextmenu: this.powermenufun,
                itemdblclick: this.opendoc,
                itemcontextmenu: this.powermenufun
            },
            'projectList pagingtoolbar button': {
                click: function(obj, event){
                    //get store getProxy , then proxy has extraParams param to set add param
                    obj.ownerCt.ownerCt.getStore().getProxy().extraParams={fs_id:this.getParentRecordStore().getAt(0).get('fs_id')};
                }
            },
            'powermenu':{
                click: this.getfunction
            },
            'fileuploadPanel button[text="使用拖拽上传模式"]':{
                click: function(buttonobj,e){
                    buttonobj.ownerCt.ownerCt.ownerCt.close();
                    this.dragupload(this.gridview, this.rcd, this.event);
                }
            },
            'dragfileuploadPanel button[text="返回原有上传模式"]':{
                click: function(buttonobj,e){
                    buttonobj.ownerCt.ownerCt.ownerCt.close();
                    this.upload(this.gridview, this.rcd, this.item, this.rowindex, this.event);
                }
            },
            'historypanel':{
                itemcontextmenu:this.historymenu,
                containercontextmenu: function(obj, e){
                    e.stopEvent();
                }
            }
        });
        this.powermenu = Ext.widget('powermenu');
    },
    delayitemclick:function(){
        if(arguments[1]=='click'){
            this.itemclick.apply(this, arguments[0]);
        }else{
            this.itemdblclick.apply(this, arguments[0]);
        }
    },
    itemcollapse : function(rcd){

    },
    beforeitemexpand: function(rcd){
        this.getTreeStore().getProxy().extraParams={fs_id:rcd.get('fs_id')};
        //this.getListStore().load({params:{fs_id:rcd.get('fs_id')}}); //加载grid数据
    },
    itemclick : function(view, rcd, item, index, event) {
        event.preventDefault();
        event.stopEvent();
        view.toggleOnDblClick=false; //取消双击展开折叠菜单行为
        if(!rcd.isLoaded()){
            this.getListStore().load({params:{fs_id:rcd.get('fs_id')}}); //加载grid数据
            this.getTreeStore().getProxy().extraParams={fs_id:rcd.get('fs_id')};
            this.getTreeStore().load({node:rcd, callback:function(){view.refresh();}});

        }else{
            this.getListStore().load({params:{fs_id:rcd.get('fs_id')}}); //加载grid数据 
        }
        this.getParentRecordStore().removeAll();
        this.getParentRecordStore().add(rcd);
    },
    itemdblclick : function(view, rcd, item, index, event) {
        event.preventDefault();
        event.stopEvent();
        this.opendoc(view, rcd, item, index, event);
    },
    //菜单功能
    opendoc: function(view, rcd, item, index, event){
        event.preventDefault();
        event.stopEvent();
        if(rcd.get('fs_isdir')==1){
            //add parent record
            this.getParentRecordStore().removeAll();
            this.getParentRecordStore().add(rcd);
            this.getListStore().load({params:{fs_id:rcd.get('fs_id')}}); //加载grid数据 
            this.getTreeStore().getNodeById(rcd.get('fs_id')).expand();//加载tree数据
        }
        if(rcd.get('fs_isdir')==0){
            window.open(base_path+"index.php?c=document&a=openfile&fs_id="+rcd.get('fs_id')+'&t='+rcd.get('fs_type'));
        }
    },
    //权限菜单
    powermenufun: function(view, rcd, item, index, event){
        if(arguments.length==2){
            arguments[1].preventDefault();
            arguments[1].stopEvent();
            this.gridview=arguments[0];
            var obj='gridmenu';
            this.rcd=this.getParentRecordStore().getAt(0);
            this.item=undefined;
            this.rowindex=undefined;
            this.event=arguments[1];
            this.powermenu.addMenuItem(null,null, obj); //根据是否是文件进行显示
            this.powermenu.showAt(arguments[1].getXY());
        }else{
            event.preventDefault();
            event.stopEvent();
            view.getSelectionModel().select(rcd);
            //防止重复创建VIEW
            this.rcd=rcd;
            this.gridview=view;
            this.item=item;
            this.rowindex=index;
            this.event=event;
            var obj='powermenu';
            this.powermenu.addMenuItem(rcd.get('fs_isdir'),rcd.get('fs_parent'), obj); //根据是否是文件进行显示
            this.powermenu.showAt(event.getXY());
        }
    },
    getfunction: function(menu, item, e){
        if(typeof item=='undefined'){return false;}
        if(item.ename=='open'){
            this.opendoc(this.gridview, this.rcd, this.item, this.rowindex, this.event);
        }else if(item.ename=='copystruct'){
            this.copystruct(this.gridview, this.rcd, this.item, this.rowindex, this.event);
        }else if(item.ename=='alterfile'){
            this.alterfile(this.gridview, this.rcd, this.item, this.rowindex, this.event);
        }else if(item.ename=='addshare'){
            this.addshare(this.gridview, this.rcd, this.item, this.rowindex, this.event);
        }else if(item.ename=='cannelshare'){
            this.cannelshare(this.gridview, this.rcd, this.item, this.rowindex, this.event);
        }else if(item.ename=='history'){
            this.history(this.gridview, this.rcd, this.item, this.rowindex, this.event);
        }else if(item.ename=='download'){
            this.download(this.gridview, this.rcd, this.item, this.rowindex, this.event);
        }else if(item.ename=='powersetting'){
            this.powersetting(this.gridview, this.rcd, this.item, this.rowindex, this.event);
        }else if(item.ename=='del'){
            this.del(this.gridview, this.rcd, this.item, this.rowindex, this.event);
        }else if(item.ename=='newdir'){
            this.newdir(this.gridview, this.rcd, this.item, this.rowindex, this.event);
        }else if(item.ename=='upload'){
            this.upload(this.gridview, this.rcd, this.item, this.rowindex, this.event);
        }else if(item.ename=='refresh'){
            this.refreshtree(this.gridview, this.rcd, this.item, this.rowindex, this.event);
        }
    },
    copystruct: function(view, rcd, item, index, event){

    },
    alterfile: function(view, rcd, item, index, event){
        if(rcd.get('fs_isdir')==1){
            this.editdocumentformPanel(view, rcd, item, index, event);
        }else{
            this.editfileformPanel(view, rcd, item, index, event); 
        }
    },
    addshare: function(view, rcd, item, index, event){
        sharedoc_setting(rcd);
    },
    cannelshare: function(view, rcd, item, index, event){
        sharedoc_delsetting(rcd);
    },
    history: function(view, rcd, item, index, event){
        var panel = Ext.widget("historypanel");
        var win = Ext.create('Ext.window.Window',{
            layout:'fit',
            width:700,
            height: 400,
            //closeAction:'hide',
            resizable: true,
            shadow: true,
            modal: true,
            items: panel
        });
        panel.getView().getStore().getProxy().extraParams={fs_id:rcd.get('fs_id')};
        panel.getView().getStore().load();
        win.setTitle('历史版本');
        win.show();
    },
    historymenu:function(view, rcd, item, index, event){
        event.stopEvent();
        var gridmenu =Ext.create('Ext.menu.Menu', {});
        var me=this;
        gridmenu.add({
            text: '下载',
            iconCls: 'icon-doc-download',
            handler: function(obj,e){
                obj.up("menu").hide();
                me.download(view, rcd, item, index, event);
            }
        });
        gridmenu.showAt(event.getXY());
    },
    download: function(view, rcd, item, index, event){
        Ext.Msg.show({  
            title:'提示',
            closable: false, 
            msg:'确定下载 '+rcd.get('fs_intro')+' 吗？', 
            icon:Ext.MessageBox.QUESTION,
            buttons: Ext.Msg.OKCANCEL,
            fn: function(btn){
                if(btn=='ok'){
                    var msgTip = Ext.MessageBox.show({
                        title:'提示',
                        width: 250,
                        msg: '正在获取下载资源……'
                    });

                    Ext.Ajax.request({
                        url: base_path + "index.php?c=document&a=downloadfile",
                        params : rcd.getData(),
                        method : 'POST',
                        success: function(response, options){
                            msgTip.hide();
                            var result = Ext.JSON.decode(response.responseText);
                            if(result.success){
                                location.href=base_path + "index.php?c=document&a=downloadfile&file="+result.msg;
                                return true;
                            }else{
                                Ext.Msg.alert('提示', result.msg); 
                                return false;
                            }
                        }
                    });    
                }
                return false;
            } 
        });
    },
    powersetting: function(view, rcd, item, index, event){
        var powersettingWin=Ext.widget('powersetting', {rcd:rcd});
        //console.log(powersettingWin);
        powersettingWin.show();
    },
    del: function(view, rcd, item, index, event){
        Ext.Msg.show({  
            title:'提示',
            closable: false, 
            msg:'确定删除 '+rcd.get('text'), 
            icon:Ext.MessageBox.QUESTION,
            buttons: Ext.Msg.OKCANCEL,
            fn: function(btn){
                if(btn=='ok'){
                    var msgTip = Ext.MessageBox.show({
                        title:'提示',
                        width: 250,
                        msg: '正在删除……'
                    });
                    Ext.Ajax.request({
                        url: base_path + "index.php?c=document&a=deldocument",
                        params : rcd.getData(),
                        method : 'POST',
                        success: function(response, options){
                            msgTip.hide();
                            var result = Ext.JSON.decode(response.responseText);
                            if(result.success){
                                Ext.Msg.alert('提示', result.msg);
                                view.getStore().remove(rcd);
                                view.refresh();
                                return true;
                            }else{
                                Ext.Msg.alert('提示', result.msg);
                                view.refresh(); 
                                return false;
                            }
                        }
                    });
                }
                return false;
            } 
        });
    },
    newdir: function(view, rcd, item, index, event){
        if(typeof rcd=='undefined'){ //if it is gridmenu
            var parent_record = this.getParentRecordStore().getAt(0);
        }else{
            var parent_record=rcd;
        }
        var adddocumentformPanel = Ext.create('Ext.form.Panel', {
            autoHeight : true,
            frame: true,
            bodyStyle: 'padding: 5 5 5 5',
            defaultType: 'textfield',
            buttonAlign: 'center',
            defaults: {
                autoFitErrors: false,
                labelSeparator : '：',
                labelWidth: 80,
                width: 300,
                labelAlign: 'left'
                //msgTarget: 'under'  
            },
            items: [{
                xtype:'hiddenfield',
                name: 'project_doc_parentid',
                value: parent_record.get('fs_id')
            },{
                xtype:'textfield',
                fieldLabel: '上级文件夹',
                readOnly:true,
                value:parent_record.get('text')
            }, {
                xtype:'textfield',
                name: 'project_doc_name',
                id: 'project_doc_name',
                allowBlank: false,
                blankText: '不允许为空',
                fieldLabel: '文件夹编号'
            }, {
                xtype:'textfield',
                width: 300,
                name: 'project_doc_intro',
                id: 'project_doc_intro',
                allowBlank: false,
                blankText: '不允许为空',
                fieldLabel: '文件夹名称'
            },{
                xtype:'radiogroup',
                fieldLabel: '是否加密',
                width:250,
                items: [
                { boxLabel: '是', name: 'encrypt', inputValue: '1'},
                { boxLabel: '否', name: 'encrypt', inputValue: '0', checked:true}
                ]
            }],
            buttons:[{
                text: '添加',
                handler: function(){
                    if(adddocumentformPanel.form.isValid()){
                        adddocumentformPanel.getForm().submit({
                            url: base_path+'index.php?c=document&a=adddocument',
                            method: 'post',
                            timeout: 30,
                            params: adddocumentformPanel.getForm().getValues,
                            success: function(form, action){
                                Ext.Msg.alert('温馨提示', action.result.msg);
                                view.ownerCt.getStore().load({params:{fs_id:parent_record.get('fs_id')}});
                                win.close();
                            },
                            failure: function(form, action){
                                Ext.Msg.alert('温馨提示', action.result.msg);
                            }
                        });
                    }
                }
            }]
        });
        var win = Ext.create('Ext.window.Window',{
            layout:'fit',
            width:350,
            resizable: false,
            modal: true,
            closable : true,
            items: adddocumentformPanel
        });
        win.setTitle('新建文件夹');
        win.show();
    },
    upload: function(view, rcd, item, index, event){
        if(typeof rcd=='undefined'){ //if it is gridmenu
            var parent_record = this.getParentRecordStore().getAt(0);
        }else{
            var parent_record=rcd;
        }
        var fileitem=Ext.widget('fileuploadPanel', {
            parent_record:parent_record,
            savePath:parent_record.get('fs_fullpath'),
            ListStore:this.getListStore() 
        });
        var fileuploadstore=this.getFileUploadStore();
        var win = Ext.create('Ext.window.Window',{
            layout:'fit',
            width:'80%',
            resizable: true,
            modal: true,
            closable : true,
            items: fileitem,
            listeners:{
                'close':function(panel, eOpts){
                    fileuploadstore.removeAll();
                    fileitem.getComponent('fileuploadgrid').getView().refresh();
                }
            }
        });
        win.setTitle('上传文件---文件夹'+parent_record.get('text'));
        win.show();
    },    
    dragupload: function(view, rcd, event){
        if(typeof rcd=='undefined'){ //if it is gridmenu
            var parent_record = this.getParentRecordStore().getAt(0);
        }else{
            var parent_record=rcd;
        }
        var fileitem=Ext.widget('dragfileuploadPanel', {
            parent_record:parent_record,
            savePath:parent_record.get('fs_fullpath'),
            ListStore:this.getListStore() 
        });
        var fileuploadstore=this.getFileUploadStore();
        var win = Ext.create('Ext.window.Window',{
            layout:'fit',
            width:'80%',
            resizable: true,
            modal: true,
            closable : true,
            items: fileitem,
            listeners:{
                'close':function(panel, eOpts){
                    fileuploadstore.removeAll();
                    fileitem.getComponent('dragfileuploadgrid').getView().refresh();
                }
            }
        });
        win.setTitle('上传文件---文件夹'+parent_record.get('text'));
        win.show();
    },
    refreshtree: function(view, rcd, item, index, event){
        refreshtree(rcd, 1);
    },

    //文件夹编辑
    editdocumentformPanel:function(view, rcd, item, index, event){
        var editprojectform = Ext.create('Ext.form.Panel', {
            frame: true,
            bodyStyle: 'padding: 5 5 5 5',
            defaultType: 'textfield',
            buttonAlign: 'center',
            defaults: {
                autoFitErrors: false,
                labelSeparator : '：',
                labelWidth: 80,
                allowBlank: false,
                blankText: '不允许为空',
                labelAlign: 'left',
                msgTarget: 'under'  
            },
            items: [{
                xtype:'hiddenfield',
                name: 'project_doc_id',
                value: rcd.get('fs_id')
            },{
                xtype:'hiddenfield',
                name: 'document_parentid',
                value: rcd.get('fs_parent')
            },{
                xtype:'hiddenfield',
                name: 'project_doc_oldintro',
                value: rcd.get('fs_intro')
            },{
                xtype:'textfield',
                name: 'project_doc_name',
                fieldLabel: '编号',
                width: 250,
                value:rcd.get('fs_name')
            }, {
                xtype:'textfield',
                width: 250,
                name: 'project_doc_intro',
                fieldLabel: '名称',
                value:rcd.get('fs_intro')
            },{
                xtype:'radiogroup',
                fieldLabel: '是否加密',
                width:250,
                items: [
                { boxLabel: '是', name: 'encrypt', inputValue: '1', checked:'1'==rcd.get('fs_encrypt')},
                { boxLabel: '否', name: 'encrypt', inputValue: '0', checked:'0'==rcd.get('fs_encrypt')}
                ]
            }],
            buttons:[{
                text: '确定',
                handler: function(){
                    if(editprojectform.form.isValid()){
                        editprojectform.getForm().submit({
                            url: base_path+'index.php?c=document&a=editdocument',
                            method: 'post',
                            timeout: 30,
                            params: editprojectform.getForm().getValues(),
                            success: function(form, action){
                                Ext.Msg.alert('温馨提示', action.result.msg);
                                rcd.set('text', action.result.data.document_pathname);
                                rcd.set('fs_name', action.result.data.document_name);
                                rcd.set('fs_intro', action.result.data.document_intro);
                                rcd.set('fs_encrypt', action.result.data.fs_encrypt);
                                rcd.set('fs_lastmodify', action.result.data.fs_lastmodify);
                                rcd.commit();
                                win.hide(); 
                            },
                            failure: function(form, action){
                                Ext.Msg.alert('温馨提示', action.result.msg);
                            }
                        });
                    }
                }
            }]
        });
        var win = Ext.create('Ext.window.Window',{
            layout:'fit',
            width:350,
            closeAction:'hide',
            resizable: false,
            shadow: true,
            modal: true,
            closable : true,
            items: editprojectform
        });
        editprojectform.form.reset();
        editprojectform.isAdd = true;
        win.setTitle('编辑-'+rcd.get('fs_name'));
        win.show();
    },
    //文件编辑
    editfileformPanel: function(view, rcd, item, index, event){
        var editprojectform = Ext.create('Ext.form.Panel', {
            frame: true,
            bodyStyle: 'padding: 5 5 5 5',
            defaultType: 'textfield',
            buttonAlign: 'center',
            defaults: {
                autoFitErrors: false,
                labelSeparator : '：',
                labelWidth: 100,
                allowBlank: false,
                blankText: '不允许为空',
                labelAlign: 'left',
                msgTarget: 'under'  
            },
            items: [{
                xtype:'hiddenfield',
                name: 'file_id',
                value: rcd.get('fs_id')
            },{
                xtype:'hiddenfield',
                name: 'size',
                value: rcd.get('fs_size')
            },{
                xtype:'hiddenfield',
                name: 'type',
                value: rcd.get('fs_type')
            },{
                xtype:'hiddenfield',
                name: 'file_oldname',
                value: rcd.get('fs_name')
            },{
                xtype:'hiddenfield',
                name: 'file_parentid',
                value: rcd.get('fs_parent')
            },{
                xtype:'textfield',
                name: 'file_name',
                fieldLabel: '编号',
                width: 300,
                value:rcd.get('fs_name')
            }, {
                xtype:'textfield',
                width: 300,
                name: 'file_intro',
                fieldLabel: '名称',
                value:rcd.get('fs_intro')
            }, {
                xtype:'radiogroup',
                fieldLabel: '是否有纸版',
                width:200,
                items: [
                { boxLabel: '是', name: 'haspaper', inputValue: '1',checked:'1'==rcd.get('fs_haspaper')},
                { boxLabel: '否', name: 'haspaper', inputValue: '0',checked:'0'==rcd.get('fs_haspaper')}
                ]
            }, {
                xtype:'radiogroup',
                fieldLabel: '是否加密',
                width:200,
                items: [
                { boxLabel: '是', name: 'encrypt', inputValue: '1', checked:'1'==rcd.get('fs_encrypt')},
                { boxLabel: '否', name: 'encrypt', inputValue: '0', checked:'0'==rcd.get('fs_encrypt')}
                ]
            }],
            buttons:[{
                text: '确定',
                handler: function(){
                    if(editprojectform.form.isValid()){
                        editprojectform.getForm().submit({
                            url: base_path+'index.php?c=document&a=editfile',
                            method: 'post',
                            timeout: 30,
                            params: editprojectform.getForm().getValues(),
                            success: function(form, action){
                                win.hide();
                                Ext.Msg.alert('温馨提示', action.result.msg);

                                rcd.set('text', action.result.data.document_pathname);

                                rcd.set('fs_name', action.result.data.document_name);
                                rcd.set('fs_intro', action.result.data.document_intro);
                                rcd.set('fs_haspaper', action.result.data.fs_haspaper);
                                rcd.set('fs_encrypt', action.result.data.fs_encrypt);
                                rcd.set('fs_lastmodify', action.result.data.fs_lastmodify);
                                rcd.commit();
                            },
                            failure: function(form, action){
                                Ext.Msg.alert('温馨提示', action.result.msg);
                            }
                        });
                    }
                }
            }]
        });

        var win = Ext.create('Ext.window.Window',{
            layout:'fit',
            width:350,
            closeAction:'hide',
            resizable: false,
            shadow: true,
            modal: true,
            closable : true,
            items: editprojectform
        });
        editprojectform.form.reset();
        win.setTitle('编辑-'+rcd.get('fs_name'));
        win.show();
    }
    //file edit function end
})