function onFormSubmit() {
	// do nothing
	return true;
}

$(function(){

	$ZMI.setCursorWait("BO bootstrap.plugin.zmi");

	// Sitemap
	var $icon_sitemap = $('#zmi-header a '+$ZMI.icon_selector("icon-sitemap"));
	if ($icon_sitemap.length > 0) {
		var $a = $icon_sitemap.closest("a");
		if (self.window.parent.frames.length > 1 && typeof self.window.parent != "undefined" && (self.window.parent.location+"").indexOf('dtpref_sitemap=1') > 0) {
			$a.attr('target','_parent');
		}
		else {
			$a.attr('href',$a.attr('href')+'&dtpref_sitemap=1');
		}
	}

	// Textarea:
	// single-line
	$('div.single-line').each(function() {
			var $single_line = $(this);
			var $textarea = $('textarea',this);
			$textarea.prop({rows:1,wrap:'off'});
			if ($single_line.hasClass("zmi-nodes")) {
				$textarea.prop({title:getZMILangStr('ATTR_NODE')});
			}
			if ($("span.input-group-addon",this).length==0) {
				$(this).addClass("input-group");
				if ($textarea.attr('data-style')) {
					$(this).append('<span class="input-group-addon" title="Click for Code Popup or Dbl-Click for Zope Editor!" style="' + $textarea.attr('data-style') + '">   </span>');
				} else {
					$(this).append('<span class="input-group-addon">...</span>');
				};
				var clicks, timer, delay;
				clicks=0;delay=500;timer=null;
				$('span.input-group-addon',this).on('click', function(){
					clicks++;
					timer = setTimeout(function() {
						switch(clicks){
							case 1:
								var html = '';
								html = html
									+ '<div id="zmi-single-line-edit" class="inner">'
										+ '<form class="form-horizontal" name="zmi-single-line-form">';
								if ($single_line.hasClass("zmi-nodes")) {
									html = html
											+ '<div class="col-lg-10">'
												+ '<div class="input-group">'
													+ '<input class="form-control" type="text" name="zmi-nodespicker-url-input" class="url-input">'
													+ '<span class="input-group-addon" onclick="zmiBrowseObjs(\'zmi-single-line-form\',\'zmi-nodespicker-url-input\',getZMILang())">...</span>'
												+ '</div><!-- .input-append -->'
											+ '</div><!-- .col-lg-10 -->';
								}
								html = html
											+ '<textarea class="form-control" rows="10" wrap="off" style="overflow:scroll">' + $textarea.val() + '</textarea>'
										+ '</form>'
									+ '</div><!-- #zmi-single-line-edit -->';
								zmiModal(null,{
									body:html,
									resizable:true,
									title:getZMILangStr('BTN_EDIT')+': '+$textarea.attr('title'),
									resize: function( event, ui ) {
										var $container = $('#zmi-single-line-edit');
										var $ta = $('textarea',$container);
										var taCoords = zmiGetCoords($ta[0],"relative");
										$ta.css({height:Math.max(20,$container.innerHeight()-taCoords.y-20)+'px'});
									},
									close: function( event, ui ) {
										$textarea.val($('#zmi-single-line-edit textarea').val());
									}});
							break;
							case 2:
								eval($textarea.attr('data-dblclickhandler'));
							break;
						}
					clicks=0;
					}, delay);
				});
			}
		});

	// Double-Clickable
	$('table.table-hover tbody tr')
		.dblclick( function(evt) {
			var href = null;
			if ((href==null || typeof href=="undefined") && $('a '+$ZMI.icon_selector("icon-pencil"),this).length > 0) {
				href = $('a '+$ZMI.icon_selector("icon-pencil"),this).parents("a:first").attr('href');
			}
			else if ((href==null || typeof href=="undefined")) {
				href = $('a[target=]',this).attr('href');
			}
			if (!(href==null || typeof href=="undefined")) {
				self.location.href = href;
			} 
		})
		.attr( "title", "Double-click to edit!");

	// Sortable
	$("ul.zmi-container.zmi-sortable img.grippy").mouseover(function() {
		if (typeof self.zmiUlSortableInitialized == "undefined") {
			self.zmiUlSortableInitialized = true;
			pluginUI("ul.zmi-container.zmi-sortable",function() {
				$("ul.zmi-container.zmi-sortable").sortable({
					delay:500,
					forcePlaceholderSize:true,
					handle:'img.grippy',
					placeholder: "ui-state-highlight",
					revert: true,
					start: function(event, ui) {
							$ZMI.writeDebug('ul.zmi-container.zmi-sortable: start');
							var el = $(".zmi-container .zmi-item");
							$(el).removeClass("highlight");
							self.zmiSortableRownum = false;
							var c = 1;
							$(".zmi-sortable > li").each(function() {
									if ($(this).attr("id") == ui.item.attr("id")) {
										self.zmiSortableRownum = c;
									}
									c++;
								});
							$ZMI.writeDebug('ul.zmi-container.zmi-sortable: start - self.zmiSortableRownum='+self.zmiSortableRownum);
						},
					stop: function(event, ui) {
							$ZMI.writeDebug('ul.zmi-container.zmi-sortable: stop');
							var pos = $(this).position();
							if (self.zmiSortableRownum) {
								$ZMI.writeDebug('ul.zmi-container.zmi-sortable: stop - self.zmiSortableRownum='+self.zmiSortableRownum);
								var c = 1;
								$(".zmi-sortable > li").each(function() {
										if ($(this).attr("id") == ui.item.attr("id")) {
											if(self.zmiSortableRownum != c) {
												var id = $ZMI.actionList.getContextId(ui.item);
												var href = id+'/manage_moveObjToPos?lang='+getZMILang()+'&pos:int='+c+'&fmt=json';
												$ZMI.writeDebug('ul.zmi-container.zmi-sortable: stop - href='+href);
												$.get(href,function(result){
														var message = eval('('+result+')');
														$ZMI.showMessage(pos,message,"alert-success");
													});
											}
										}
										c++;
									});
							}
							self.zmiSortableRownum = false;
						}
					});
				});
			}
		});
	// Checkboxes
	$(".zmi-container .zmi-item:first .right input[name='active']:checkbox")
		.change(function() {
				zmiToggleSelectionButtonClick(this,$(this).prop("checked"));
			});
	$(".zmi-container .right input[name='ids:list']")
		.change(zmiActionButtonsRefresh)
		;
	// Detail-Info
	$(".zmi-container .zmi-item .zmi-manage-main-change")
		.each( function() {
				$(this).html($(this).html().replace(/<span([^<]*?)>(\r|\n|\t|\s)*?<\/span>/gi,''));
			});
	runPluginCookies(function() {
			var key = 'zmi-manage-main-change';
			var value = $.cookies.get(key);
			$(".zmi-container .zmi-item .zmi-manage-main-change:first")
				.each( function() {
						$('<span class="zmi-manage-main-toggle">'+$ZMI.icon("icon-info-sign")+'</span>').insertBefore($(this));
					});
			$('.zmi-manage-main-toggle '+$ZMI.icon_selector("icon-info-sign")).on('click',function(event,programmatically,speed) {
					if (!programmatically) {
						toggleCookie(key);
					}
					$(this).toggleClass('active');
					$('.zmi-manage-main-change').toggle(typeof speed=='undefined'?'normal':speed);
				});
			if (value=='1') {
				$('.zmi-manage-main-toggle '+$ZMI.icon_selector("icon-info-sign")).trigger('click',[true,'fast']);
			}
		});
	// Action-Lists
	$(".btn-group")
		.mouseover( function(evt) {
				$(this).parents(".accordion-body.collapse").css({overflow:"visible"});
			})
		.mouseout( function(evt) {
				$(this).parents(".accordion-body.collapse").css({overflow:"hidden"});
			});
	$(".zmi-container .zmi-item .zmi-action")
		.each( function(evt) {
				var $button = $('button.btn.split-right.dropdown-toggle',this);
				$button.append($ZMI.icon("icon-chevron-down"));
				$($ZMI.icon_selector("icon-chevron-down"),$button).hide();
			})
		.focus( function(evt) { $ZMI.actionList.over(this,"focus"); })
		.hover( function(evt) {
				$ZMI.actionList.over(this,"mouseover");
				var $button = $('button.btn.split-right.dropdown-toggle',this);
				$(':not('+$ZMI.icon_selector("icon-chevron-down")+')',$button).hide();
				$($ZMI.icon_selector("icon-chevron-down"),$button).show();
			},
			function(evt) {
				$ZMI.actionList.out(this,"mouseout");
				var $button = $('button.btn.split-right.dropdown-toggle',this);
				$($ZMI.icon_selector("icon-chevron-down"),$button).hide();
				$(':not('+$ZMI.icon_selector("icon-chevron-down")+')',$button).show();
			})
		;
	// Inputs
	$ZMI.initInputFields($("body"));
	$(".zmi-image,.zmi-file").each(function() {
			$(this).addClass("span5");
			var elName = $(this).attr("id");
			elName = elName.substr(elName.lastIndexOf("-")+1);
			zmiRegisterBlob(elName);
			$("li#delete_btn_"+elName+" a",this).attr("href","javascript:zmiDelBlobBtnClick('"+elName+"')");
			$("li#undo_btn_"+elName+" a",this).attr("href","javascript:zmiUndoBlobBtnClick('"+elName+"')");
			zmiSwitchBlobButtons(elName);
		});

	$ZMI.setCursorAuto("EO bootstrap.plugin.zmi");

});

/**
 * Unlock form
 */
function zmiUnlockForm(form_id) {
	var $form = $('input[name="form_id"][value="'+form_id+'"]').parents("form");
	if ($('input[name="form_unlock"]',$form).length==0) {
		$form.append('<input type="hidden" name="form_unlock" value="1">');
	}
	$form.submit();
}

/**
 * Init input_fields
 */ 
ZMI.prototype.initInputFields = function(container) {
	$ZMI.setCursorWait("BO zmiInitInputFields");
	$('form.form-horizontal',container)
		.submit(function() {
				var b = true;
				// Button
				if(self.btnClicked==getZMILangStr("BTN_BACK") ||
						self.btnClicked==getZMILangStr("BTN_CANCEL")) {
					return b;
				}
				// Multiple-Selects
				$('select[multiple="multiple"]',this).each(function() {
						var name = $(this).attr("name");
						var form = $(this).parents("form");
						if ($('select[name="zms_mms_src_'+name+'"]',form).length > 0) {
							$("option",this).prop("selected","selected");
						}
					});
				// Mandatory
				$(".has-error",this).removeClass("has-error");
				$(".form-group label.control-label.mandatory",this).each(function() {
						var $label = $(this);
						var labelText = $label.text().basicTrim();
						var $controlGroup = $label.parents(".form-group");
						var $controls = $("div:first",$controlGroup);
						var $control = $('input:text,input:file,select:not([name^="zms_mms_src_"])',$controls);
						$ZMI.writeDebug('submit: '+labelText+' mandatory? ['+$control.length+']');
						$label.attr("title","");
						$control.attr("title","");
						if ($control.length==1) {
							var isBlank = false;
							var nodeName = $control.prop("nodeName").toLowerCase();
							if (nodeName=="input") {
								isBlank = $control.val().basicTrim().length==0;
							}
							else if (nodeName=="select") {
								isBlank = ($("option:selected",$control).length==0) 
									|| ($("option:selected",$control).length==1 && $("option:selected",$control).attr("value")=="");
							}
							if (isBlank) {
								$controlGroup.addClass("has-error");
								$label.attr("title",getZMILangStr("MSG_REQUIRED").replace(/%s/,labelText));
								$control.attr("title",getZMILangStr("MSG_REQUIRED").replace(/%s/,labelText)).tooltip({placement:'right'});
								if (b) {
									$control.focus();
								}
								b = false;
							}
						}
					});
				// Lock
				if (b && $('input[name="form_unlock"]',this).length==0) {
					var result = $.ajax({
						url: 'ajaxGetNode',
						data:{lang:getZMILang()},
						datatype:'text',
						async: false
						}).responseText;
					var xmlDoc = $.parseXML(result);
					var $xml = $(xmlDoc);
					var change_dt = $('change_dt',$xml).text();
					var change_uid = $('change_uid',$xml).text();
					var form_id = $('input[name=form_id]').val();
					var form_dt = new Date(parseFloat(form_id)*1000);
					var checkLock = new Date(change_dt).getTime() > form_dt.getTime();
					if (checkLock) {
						zmiModal(null,{
								body:''
									+ '<div class="alert alert-error">'
										+ '<h4>'+$ZMI.icon("icon-warning-sign")+' '+getZMILangStr('ACTION_MANAGE_CHANGEPROPERTIES')+'</h4>'
										+ '<div>'+change_dt+' '+getZMILangStr('BY')+' '+change_uid+'</div>'
									+ '</div>'
									+ '<div class="form-group">'
										+ '<button class="btn btn-primary" value="'+getZMILangStr('BTN_OVERWRITE')+'" onclick="zmiUnlockForm(\''+form_id+'\')">'+getZMILangStr('BTN_OVERWRITE')+'</button> '
										+ '<button class="btn btn-default" value="'+getZMILangStr('BTN_DISPLAY')+'" onclick="window.open(self.location.href);">'+getZMILangStr('BTN_DISPLAY')+'</button> '
									+ '</div>',
								title: getZMILangStr('CAPTION_WARNING')
							});
					}
				}
				return b;
			})
		.each(function() {
			var context = this;
			$('input[type="submit"],button[type="submit"]',context)
				.click(function() {
						self.btnClicked = $(this).attr("value");
					});
			// Button-Radiogroup
			$('.btn-radiogroup',context).each(function() {
					var key = $(this).attr('data-value');
					var $input = $('input#'+key);
					var val = $input.val();
					$(this).children('span')
						.addClass("btn")
						.click(function() {
								var item = $(this).attr('data-value');
								$input.val(item);
								$(this).siblings('.btn-info').removeClass('btn-info').addClass('btn-default');
								$(this).removeClass('btn-default').addClass('btn-info');
							})
						.each(function() {
								var item = $(this).attr('data-value');
								if (val == "") {
									val = item;
									$input.val(val);
								}
								if (item==val) {
									$(this).addClass("btn-info");
								}
								else {
									$(this).addClass("btn-default");
								}
							});
				});
			// Accordion:
			// highlight default collapse item
			runPluginCookies(function() {
					$(".accordion-body").each(function() {
							var id = $(this).attr('id');
							if (typeof id != "undefined") {
								var $toggle = $('a.accordion-toggle[href=\'#'+id+'\']');
								if ($toggle.length > 0) {
									var key = 'accordion-body-'+id;
									var value = $.cookies.get(key);
									if (value != null) {
										if ($(this).hasClass('in')) {
											if (value == '0') {
												$(this).removeClass('in');
											}
										}
										else {
											if (value == '1') {
												$(this).addClass('in');
											}
										}
									}
								}
							}
						});
					$($ZMI.icon_selector()+":first",$(".accordion-body.collapse",context).prev('.accordion-heading')).removeClass($ZMI.icon_clazz("icon-caret-down")).addClass($ZMI.icon_clazz("icon-caret-right"));
					$($ZMI.icon_selector()+":first",$(".accordion-body.collapse.in",context).prev('.accordion-heading')).removeClass($ZMI.icon_clazz("icon-caret-right")).addClass($ZMI.icon_clazz("icon-caret-down"));
				});
			var accordionSetCookie = function(id,value) {
					var key = 'accordion-body-'+id;
					$.cookies.set(key,value);
				};
			$("a.accordion-toggle",this).click(function(){
					this.blur();
					var id = $(this).attr('href').substr(1);
					var showing = $($ZMI.icon_selector(),this).hasClass($ZMI.icon_clazz("icon-caret-down"))?1:0;
					if (showing) {
						$($ZMI.icon_selector(),this).removeClass($ZMI.icon_clazz("icon-caret-down")).addClass($ZMI.icon_clazz("icon-caret-right"));
						accordionSetCookie(id,'0');
					}
					else {
						$($ZMI.icon_selector(),this).removeClass($ZMI.icon_clazz("icon-caret-right")).addClass($ZMI.icon_clazz("icon-caret-down"));
						accordionSetCookie(id,'1');
					}
				});
			// Mandatory
			if ($(this).hasClass('form-insert')) {
				$(".form-group label.col-lg-2 control-label.mandatory",this).each(function() {
						var $label = $(this);
						$label.prepend($ZMI.icon("icon-exclamation"));
					});
			}
			// Url-Picker
			$("input.url-input",this).each(function() {
					var $clone = $(this).clone();
					var id = $clone.attr('id');
					$clone.addClass('form-control');
					var html = $("<div/>").append($clone).html();
					var fmName = $(this).parents("form").attr("name");
					var elName = $(this).attr("name");
					var $breadcrumb = $(this).siblings("ul.breadcrumb");
					var content = '';
					if ($breadcrumb.length > 0) {
						content = $("<div/>").append($breadcrumb).html();
						$breadcrumb.hide();
					}
					$(this).replaceWith(''
							+ '<div class="input-group">'
								+ html
								+ '<span class="input-group-addon ui-helper-clickable" onclick="return zmiBrowseObjs(\'' + fmName + '\',\'' + elName + '\',getZMILang())">'
									+ $ZMI.icon("icon-link")
								+ '</span>'
							+ '</div>'
						);
					if (content.length > 0) {
						$('#'+id).popover({
								container:'body',
								html:true,
								placement:'bottom',
								trigger:'click|hover|focus',
								content:content
							});
					}
				});
			// Date-Picker
			$("input.datepicker,input.datetimepicker",this)
			.each(function() {
				$(this).closest("div").addClass("input-group");
				$(this).before('<span class="input-group-addon">'+$ZMI.icon("icon-calendar")+'</span>');
			})
			.mouseover(function(){
				if (typeof self.zmiUlDatePickerInitialized == "undefined") {
					self.zmiUlDatePickerInitialized = true;
					pluginUIDatepicker('input.datepicker,input.datetimepicker',function(){
						$.datepicker.setDefaults( $.datepicker.regional[ pluginLanguage()]);
						$('input.datepicker',context).datepicker({
								showWeek: true
							});
						$('input.datetimepicker',context).datepicker({
								constrainInput: false,
								showWeek: true,
								beforeShow: function(input, inst) {
										var v = $(input).val();
										var e = '';
										var i = v.indexOf(' ');
										if ( i > 0) {
											e = v.substr(i+1);
											v = v.substr(0,i);
										}
										$(inst).data("inputfield",input);
										$(inst).data("extra",e);
									},
								onClose: function(dateText, inst) {
										if (dateText) {
											var input = $(inst).data("inputfield");
											var e = $(inst).data("extra");
											if (e && !dateText.endsWith(" "+e)) {
												$(input).val(dateText+" "+e);
											}
										}
									}
							});
					});
				}
			});
			// Richedit
			if ($("div.zmi-richtext",this).length > 0) {
				$(this).submit(function() {
						zmiRichtextOnSubmitEventHandler();
					});
			}
		});
	$ZMI.setCursorAuto("EO zmiInitInputFields");
}

/**
 * Show message
 */
ZMI.prototype.showMessage = function(pos, message, context) {
	$(".alert").remove();
	var html = ''
		+ '<div class="alert'+(typeof context=='undefined'?'':' '+context)+'" style="position:absolute;left:'+pos.left+'px;top:'+pos.top+'px;">'
			+ '<button type="button" class="close" data-dismiss="alert">&times;</button>'
			+ message
		+ '</div>';
	$('body').append(html);
	window.setTimeout('$(".alert").hide("slow")',2000);
}

/**
 * Open modal
 */
var zmiModalStack = [];
function zmiModal(s, opt) {
	$ZMI.setCursorWait("zmiModal");
	if (typeof opt == "undefined") {
		var id = zmiModalStack[zmiModalStack.length-1];
		$ZMI.writeDebug("zmiModal:"+s+"(id="+id+")");
		$('#'+id).modal(s);
	}
	else if (typeof opt == "object") {
		var id = typeof opt['id']=="undefined"?"zmiModal"+(s==null?zmiModalStack.length:$(s).attr('id')):opt['id'];
		var body = s==null?opt['body']:$(s).html();
		if (typeof id!="undefined" && typeof body!="undefined") {
			zmiModalStack.push(id);
			$ZMI.writeDebug("zmiModal:init(id="+id+")");
			var html = ''
				+'<div class="modal fade" id="'+id+'" tabindex="-1" role="dialog" aria-hidden="true">'
				+'<div class="modal-dialog">'
				+'<div class="modal-content">'
				+'<div class="modal-header">'
				+'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'
				+'<h4 class="modal-title">'+opt['title']+'</h4>'
				+'</div>'
				+'<div class="modal-body">'+body+'</div>'
				+'<div class="modal-footer"></div>'
				+'</div>'
				+'</div><!-- /.modal-content -->'
				+'</div><!-- /.modal-dialog -->'
				+'</div><!-- /.modal -->';
			$('#'+id).remove();
			$("body").append(html);
			var buttons = opt['buttons'];
			if (typeof buttons == 'object') {
				for (var i = 0; i < buttons.length; i++) {
					var button = buttons[i];
					$('#'+id+' .modal-footer').append('<button type="button">'+button['text']+'</button> ');
					var $button = $('#'+id+' .modal-footer button:last');
					for (var k in button) {
						var v = button[k];
						if (typeof v == "function") {
							v = (''+v).replace(/\$\(this\)\.dialog\("close"\)/gi,'$("#'+id+'").modal("hide")');
							$button.on(k,eval("("+v+")"));
						}
						else {
							$button.attr(k,v);
						}
					}
				}
			}
			$('#'+id)
				.on('show.bs.modal',function(){
						$ZMI.writeDebug("zmiModal:show(id="+zmiModalStack[zmiModalStack.length-1]+")");
						if (typeof opt['beforeOpen'] == 'function') {
							opt['beforeOpen'](this);
						}
					})
				.on('shown.bs.modal',function(){
						$ZMI.writeDebug("zmiModal:shown(id="+zmiModalStack[zmiModalStack.length-1]+")");
						if (typeof opt['open'] == 'function') {
							opt['open'](this);
						}
					})
				.on('hide.bs.modal',function(){
						$ZMI.writeDebug("zmiModal:hide(id="+zmiModalStack[zmiModalStack.length-1]+")");
						if (typeof opt['beforeClose'] == 'function') {
							opt['beforeClose'](this);
						}
					})
				.on('hidden.bs.modal',function(){
						$ZMI.writeDebug("zmiModal:hidden(id="+zmiModalStack[zmiModalStack.length-1]+")");
						if (typeof opt['close'] == 'function') {
							opt['close'](this);
						}
						zmiModalStack.pop();
					})
				.modal();
			$('#'+id+' .modal-dialog').css('transform','translate('+(zmiModalStack.length*2)+'em,'+(zmiModalStack.length*2)+'em)');
		}
	}
	$ZMI.setCursorAuto("zmiModal");
}

/**
 * Open link in iframe (jQuery UI Dialog).
 */
function zmiIframe(href, data, opt) {
	$ZMI.setCursorWait("zmiIframe");
	// Debug
	var url = href + "?";
	for (var k in data) {
		url += k + "=" + data[k] + "&";
	}
	$ZMI.writeDebug("zmiIframe:url="+url);
	// Iframe
	if (typeof opt['iframe'] != 'undefined') {
		opt['body'] = '<iframe src="' + url + '" width="' + opt['width'] + '" height="' + opt['height'] + '" frameBorder="0"></iframe>';
		zmiModal(null,opt);
		$ZMI.setCursorAuto("zmiIframe");
	}
	else {
		$.get( href, data, function(result) {
				var $result = $(result);
				if ($("div#system_msg",$result).length>0) {
					var manage_tabs_message = $("div#system_msg",$result).text();
					manage_tabs_message = manage_tabs_message.substr(0,manage_tabs_message.lastIndexOf("("));
					var href = self.location.href;
					href = href.substr(0,href.indexOf("?"))+"?lang="+getZMILang()+"&manage_tabs_message="+manage_tabs_message;
					self.location.href = href;
				}
				else {
					opt['body'] = result;
					if (typeof opt['title'] == "undefined") {
						var title = $("div.zmi",result).attr("title");
						if (typeof title != "undefined" && title) {
							opt['title'] = title;
						}
					}
					zmiModal(null,opt);
					$ZMI.setCursorAuto("zmiIframe");
				}
			});
	}
}

// #############################################################################
// ### ZMI Action-Lists
// #############################################################################

ZMIActionList = function() {};
$ZMI.actionList = new ZMIActionList();

ZMIActionList.prototype.getContextId = function(el) {
	var context = $(el).hasClass("zmi-item")?$(el):$(el).parents("li.zmi-item");
	var context_id = $(context).attr("id");
	return typeof context_id == "undefined" || context_id == ""?"":context_id.replace(/zmi_item_/gi,"");
}

/**
 * Populate and show action-list.
 *
 * @param el
 */
ZMIActionList.prototype.over = function(el, evt) {
	$("button.split-left",el).css({visibility:"visible"});
	// Exit.
	if($("button.split-left",el).length==0 || $("ul.dropdown-menu",el).length>0) return;
	// Set wait-cursor.
	$(document.body).css( "cursor", "wait");
	// Build action and params.
	var context_id = this.getContextId(el);
	var action = self.location.href;
	action = action.substr(0,action.lastIndexOf("/"));
	action += "/manage_ajaxZMIActions";
	var params = {};
	params['lang'] = getZMILang();
	params['context_id'] = context_id;
	// JQuery.AJAX.get
	$.get( action, params, function(data) {
		// Reset wait-cursor.
		$(document.body).css( "cursor", "auto");
		// Exit.
		if($("ul.dropdown-menu",el).length>0) return;
		// Get object-id.
		var value = eval('('+data+')');
		var id = value['id'].replace(/\./,"_");
		var actions = value['actions'];
		$(el).append('<ul class="dropdown-menu"></ul>');
		var $ul = $("ul.dropdown-menu",el);
		var startsWithSubmenu = actions.length > 1 && actions[1][0].indexOf("-----") == 0 && actions[1][0].lastIndexOf("-----") > 0;
		if (startsWithSubmenu) {
			var html = '';
			var opticon = '';
			if (actions[1].length > 2) {
				if (actions[1][2].indexOf('<')==0) {
					opticon = actions[1][2];
				}
				else {
					opticon = $ZMI.icon(actions[1][2]);
				}
			}
			var optlabel = actions[1][0];
			optlabel = optlabel.substr("-----".length);
			optlabel = optlabel.substr(0,optlabel.lastIndexOf("-----"));
			optlabel = optlabel.basicTrim();
			$("button.split-left",el).html(opticon+' '+optlabel).click(function(){
					return false;
				});
		}
		else {
			// Edit action
			$("button.split-left",el).click(function() {
					var action = self.location.href;
					action = action.substr(0,action.lastIndexOf("/"));
					action += context_id==""?"/manage_properties":"/"+context_id+"/manage_main";
					action += "?lang=" + getZMILang();
					self.location.href = action;
					return false;
				});
			//
			$ul.append('<li><a href="javascript:zmiToggleSelectionButtonClick($(\'li.zmi-item' + (id==''?':first':'#zmi_item_'+id) + '\'))">'+$ZMI.icon("icon-check")+' '+getZMILangStr('BTN_SLCTALL')+'/'+getZMILangStr('BTN_SLCTNONE')+'</a></li>');
		}
		for (var i = 2; i < actions.length; i++) {
			var optlabel = actions[i][0];
			var optvalue = actions[i][1];
			if (optlabel.indexOf("-----") == 0 && optlabel.lastIndexOf("-----") > 0) {
				var opticon = '';
				if (actions[i].length > 2) {
					if (actions[i][2].indexOf('<')==0) {
						opticon = actions[i][2];
					}
					else {
						opticon = $ZMI.icon(actions[i][2]);
					}
				}
				optlabel = optlabel.substr("-----".length);
				optlabel = optlabel.substr(0,optlabel.lastIndexOf("-----"));
				optlabel = optlabel.basicTrim();
				$ul.append('<li class="divider"></li>');
				$ul.append('<li class="dropdown-header">'+opticon+' '+optlabel+'</li>');
			}
			else {
				var opticon = '';
				if (actions[i].length > 2) {
					if (actions[i][2].indexOf('<')==0) {
						opticon = actions[i][2];
					}
					else {
						opticon = $ZMI.icon(actions[i][2]);
					}
				}
				else if (optvalue.indexOf('manage_del') >= 0 || optvalue.indexOf('manage_erase') >= 0) {
					opticon = $ZMI.icon("icon-trash");
				}
				else if (optvalue.indexOf('manage_main') >= 0) {
					opticon = $ZMI.icon("icon-edit");
				}
				else if (optvalue.indexOf('manage_undo') >= 0) {
					opticon = $ZMI.icon("icon-undo");
				}
				else if (optvalue.indexOf('manage_cut') >= 0) {
					opticon = $ZMI.icon("icon-cut");
				}
				else if (optvalue.indexOf('manage_copy') >= 0) {
					opticon = $ZMI.icon("icon-copy");
				}
				else if (optvalue.indexOf('manage_paste') >= 0) {
					opticon = $ZMI.icon("icon-paste");
				}
				else if (optvalue.indexOf('manage_moveObjUp') >= 0) {
					opticon = $ZMI.icon("icon-sort-up");
				}
				else if (optvalue.indexOf('manage_moveObjDown') >= 0) {
					opticon = $ZMI.icon("icon-sort-down");
				}
				var html = '';
				html += '<li><a href="javascript:$ZMI.actionList.exec($(\'li.zmi-item' + (id==''?':first':'#zmi_item_'+id) + '\'),\'' + optlabel + '\',\'' + optvalue + '\')">';
				html += opticon+' '+optlabel;
				html += '</a></li>';
				$ul.append(html);
			}
		}
	});
}

/**
 * Hide action-list.
 *
 * @param el
 */
ZMIActionList.prototype.out = function(el, evt) {
	$("button.split-left",el).css({visibility:"hidden"});
}

/**
 *  Execute action.
 */
ZMIActionList.prototype.exec = function(sender, label, target) {
	var $el = $(".zmi-action",sender);
	var $fm = $el.parents("form");
	$("input[name='custom']").val(label);
	$("input[name='_sort_id:int']").val($(".zmi-sort-id",$el).text());
	if (target.toLowerCase().indexOf('manage_addproduct/')==0 && target.toLowerCase().indexOf('form')>0) {
		// Parameters
		var inputs = $("input:hidden",$fm);
		var data = {};
		for ( var i = 0; i < inputs.length; i++) {
			var $input = $(inputs[i]);
			var id = $input.attr("id");
			if (jQuery.inArray(id,['form_id','id_prefix','_sort_id','custom','lang','preview'])>=0) {
				data[$input.attr('name')] = $input.val();
			}
		}
		var id_prefix = this.getContextId(sender);
		if (typeof id_prefix != 'undefined' && id_prefix != '') {
			data['id_prefix'] = id_prefix.replace(/\d/gi,'');
		}
		$('<li id="manage_addProduct" class="zmi-item zmi-highlighted"><div class="center"><div class="zmiRenderShort"><div class="form-label">' + getZMILangStr('BTN_INSERT')+': '+label + '</div></div></div></li>').insertAfter($el.parents(".zmi-item"));
		// Show add-dialog.
		zmiIframe(target,data,{
				id:'zmiIframeAddDialog',
				title:getZMILangStr('BTN_INSERT')+': '+label,
				width:800,
				open:function(event,ui) {
					$ZMI.runReady();
					$ZMI.initInputFields($('#zmiIframeAddDialog'));
					if($('#zmiIframeAddDialog .form-control').length==0) {
						$('#addInsertBtn').click();
					}
				},
				close:function(event,ui) {
					$('#manage_addProduct').remove();
				},
				buttons:[
						{id:'addInsertBtn', text:getZMILangStr('BTN_INSERT'), name:'btn', 'class':'btn btn-primary', click: function() { $("form.form-horizontal").append('<input type="hidden" name="btn" value="'+getZMILangStr('BTN_INSERT')+'">').submit();}},
						{id:'addCancelBtn', text:getZMILangStr('BTN_CANCEL'), name:'btn', 'class':'btn', click: function() { $(this).dialog("close");}}
				]
			});
	}
	else {
		var $div = $el.parents("div.right");
		$("input[name='ids:list']",$div).prop("checked",true);
		zmiActionButtonsRefresh(sender);
		if (this.confirm($fm,target,label)) {
			$fm.attr("action",target);
			$fm.attr("method","POST");
			$fm.submit();
		}
		else {
			$("input[name='ids:list']",$div).prop("checked",false);
			zmiActionButtonsRefresh(sender);
		}
	}
}

/**
 * Confirm execution of action from select.
 *
 * @param fm
 * @param target
 * @param label
 */
ZMIActionList.prototype.confirm = function(fm, target, label) {
	var b = true;
	var i = $("input[name='ids:list']:checkbox:checked").length;
	if (target.indexOf("../") == 0) {
		i = 1;
	}
	if (target.indexOf("manage_rollbackObjChanges") >= 0) {
		b = confirm(getZMILangStr('MSG_ROLLBACKVERSIONCHANGES'));
	}
	else if (target.indexOf("manage_cutObjects") >= 0) {
		var msg = getZMILangStr('MSG_CONFIRM_CUTOBJS');
		msg = msg.replace("%i",""+i);
		msg += $ZMI.getDescendantLanguages();
		b = i > 0 && confirm(msg);
	}
	else if (target.indexOf("manage_eraseObjs") >= 0) {
		var msg = getZMILangStr('MSG_CONFIRM_DELOBJS');
		msg = msg.replace("%i",""+i);
		b = i > 0 && confirm(msg);
	}
	else if (target.indexOf("manage_deleteObjs") >= 0) {
		var msg = getZMILangStr('MSG_CONFIRM_TRASHOBJS');
		msg = msg.replace("%i",""+i);
		msg += $ZMI.getDescendantLanguages();
		b = i > 0 && confirm(msg);
	}
	else if (target.indexOf("manage_undoObjs") >= 0) {
		var msg = getZMILangStr('MSG_CONFIRM_DISCARD_CHANGES');
		msg = msg.replace("%i",""+i);
		b = i > 0 && confirm(msg);
	}
	else if (target.indexOf("manage_executeMetacmd") >=0 ) {
		var description = $.ajax({
			url: 'getMetaCmdDescription',
			data:{name:label},
			datatype:'text',
			async: false
			}).responseText;
		if (typeof description != 'undefined' && description.length > 0) {
			b = confirm(description);
		}
	}
	else if (target == "") {
		b = false;
	}
	return b;
}

/**
 * @param sender
 * @param evt
 */
function zmiActionButtonsRefresh(sender,evt) {
	$(".zmi-selectable").each(function() {
			if ($(".right input:checked",this).length > 0) {
				$(this).addClass("zmi-selected");
				$(".zmi-manage-main-change",this).show();
			}
			else {
				$(this).removeClass("zmi-selected");
				$(".zmi-manage-main-change",this).hide();
			}
		});
}

/**
 * This method (un-)checks all id-checkboxes on page and refreshs the buttons.
 *
 * @param sender
 * @param v Boolean value for new (un-)checked state.
 */
function zmiToggleSelectionButtonClick(sender,v) {
	var $fm = $(sender).parents('form');
	var $inputs = $('input:checkbox:not([name~="active"])',$fm);
	if (typeof v == "undefined") {
		v = !$inputs.prop('checked');
	}
	$inputs.prop('checked',v).change();
	zmiActionButtonsRefresh(sender);
}

/**
 * zmiBrowseObjs
 */
function zmiBrowseObjs(fmName, elName, lang) {
	var elValue = '';
	if (fmName.length>0 && elName.length>0) {
		elValue = $('form[name='+fmName+'] input[name='+elName+']').val();
	}
	var title = getZMILangStr('CAPTION_CHOOSEOBJ');
	var href = "manage_browse_iframe";
	href += '?lang='+lang;
	href += '&fmName='+fmName;
	href += '&elName='+elName;
	href += '&elValue='+escape(elValue);
	if ( typeof selectedText == "string") {
		href += '&selectedText=' + escape( selectedText);
	}
	if ( typeof zmiParams["zmi-debug"] != "undefined") {
		href += '&zmi-debug='+zmiParams["zmi-debug"];
	}
	zmiModal(null,{
			body: '<iframe src="'+href+'" style="width:100%; min-width:'+$ZMI.getConfProperty('zmiBrowseObjs.minWidth',200)+'px; height:100%; min-height: '+$ZMI.getConfProperty('zmiBrowseObjs.minHeight',320)+'px; border:0;"></iframe>',
			title: title
		});
	return false;
}

function zmiBrowseObjsApplyUrlValue(fmName, elName, elValue) {
	$('form[name='+fmName+'] input[name='+elName+']').val(elValue);
}

function zmiDialogClose(id) {
	$ZMI.setCursorWait("zmiDialogClose::"+id);
	zmiModal("hide");
	$ZMI.setCursorAuto("zmiDialogAuto::"+id);
}

// ############################################################################
// ### Record-Sets
// ############################################################################

function zmiRecordSetMoveRow(el, qIndex) {
	var $form = $($(el).parents('form:first'));
	$form.append('<input type="hidden" name="pos:int" value="' + (qIndex+1) + '">');
	$form.append('<input type="hidden" name="newpos:int" value="' + $(el).val() + '">');
	$('input[name="action"]',$form).val('move');
	$form.submit();
}

function zmiRecordSetDeleteRow(fmName, qIndex) {
	var $form = $('form[name="'+fmName+'"]');
	if (typeof qIndex != "undefined") {
		var $input = $('input[value="'+qIndex+'"]',$form);
		$input.prop('checked',true).change();
	}
	if (confirm(getZMILangStr('MSG_CONFIRM_DELOBJ'))) {
		$('input[name="action"]',$form).val('delete');
		$form.submit();
	}
	else if (typeof qIndex != "undefined") {
		var $input = $('input[value="'+qIndex+'"]',$form);
		$input.prop('checked',false).change();
	}
	return false;
}

$(function() {
	// Sortable
	$("table.zmi-sortable tbody img.grippy").mouseover(function() {
		if (typeof self.zmiTableSortableInitialized == "undefined") {
			self.zmiTableSortableInitialized = true;
			pluginUI("ul.zmi-container.zmi-sortable",function() {
				var fixHelper = function(e, ui) { // Return a helper with preserved width of cells
					ui.children().each(function() {
						$(this).width($(this).width());
					});
					return ui;
				};
				$("table.zmi-sortable tbody").sortable({
					delay:500,
					forcePlaceholderSize:true,
					handle:'img.grippy',
					helper:fixHelper,
					placeholder: "ui-state-highlight",
					revert: true,
					start: function(event, ui) {
							self.zmiSortableRownum = false;
							var c = 1;
							$("table.zmi-sortable > tbody > tr").each(function() {
									if ($(this).attr("id") == ui.item.attr("id")) {
										self.zmiSortableRownum = c;
									}
									c++;
								});
						},
					stop: function(event, ui) {
							var pos = $(this).position();
							if (self.zmiSortableRownum) {
								var c = 1;
								$("table.zmi-sortable > tbody > tr").each(function() {
										if ($(this).attr("id") == ui.item.attr("id")) {
											if(self.zmiSortableRownum != c) {
												var id = ui.item.attr("id");
												var pos = parseInt(id.substr(id.indexOf("_")+1))+1;
												var href = 'manage_changeRecordSet?lang='+getZMILang()+'&amp;action=move&amp;btn=&amp;pos:int='+pos+'&amp;newpos:int='+c;
												self.location.href = href;
											}
										}
										c++;
									});
							}
							self.zmiSortableRownum = false;
						}
					});
				});
			}
	});
});

// ############################################################################
// ### zmiDisableInteractions
// ############################################################################

var zmiDisableInteractionsAllowed = true;

$(function() {
	// Disable on unload
	$(window).unload(function() {$ZMI.disableInteractions(true)});
});

ZMI.prototype.enableInteractions = function(b) {
	// Set wait-cursor.
	$ZMI.setCursorAuto("zmiEnableInteractions");
	// Create semi-transparent overlay
	$("div#overlay").remove();
	// Create progress-box.
	$("div#progressbox").remove();
}

ZMI.prototype.disableInteractions = function(b) {
	if (!b || !zmiDisableInteractionsAllowed) {
		zmiDisableInteractionsAllowed = true;
		return;
	}
	var $doc = $(document);
	// Set wait-cursor.
	$ZMI.setCursorWait("zmiDisableInteractions");
	// Create semi-transparent overlay
	$("body").append('<div id="zmi-overlay"></div>');
	$('#zmi-overlay').height($doc.height());
	// Create progress-box.
	$("body").append('<div id="zmi-progressbox">'
			+ '<i class="icon-spinner icon-spin"></i>&nbsp;&nbsp;' + getZMILangStr('MSG_LOADING')
		+ '</div>');
	var $div = $("#zmi-progressbox");
	$div.css({top:($(window).height()-$div.prop('offsetHeight'))/2,left:($doc.width()-$div.prop('offsetWidth'))/2});
}