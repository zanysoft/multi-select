/*
* MultiSelect v1.0.0
* Copyright (c) 2020 ZanySoft
*
*/

!function ($) {
    "use strict";

    /* MULTISELECT CLASS DEFINITION */

    var MultiSelect = function (element, options) {
        this.options = options;
        this.$element = $(element);
        this.$container = $('<div/>', {'class': "ms-container"});
        this.$selectableContainer = $('<div/>', {'class': 'ms-selectable'});
        this.$selectionContainer = $('<div/>', {'class': 'ms-selection'});
        this.$selectableSearch = $('<input/>', {'class': "ms-search-input ms-selectable-input", 'data-list': "selectable", 'placeholder': 'Search', 'autocomplete': 'off'});
        this.$selectionSearch = $('<input/>', {'class': "ms-search-input ms-selection-input", 'data-list': "selection", 'placeholder': 'Search', 'autocomplete': 'off'});
        this.$selectableUl = $('<ul/>', {'tabindex': '-1'});
        this.$selectionUl = $('<ul/>', {'tabindex': '-1'});
        this.$notify = $('<div/>', {'class': "ms-notify"});
        this.scrollTo = 0;
        this.elemsSelector = 'li:visible:not(.ms-optgroup-label,.ms-optgroup-container,.' + options.disabledClass + ')';
    };

    MultiSelect.prototype = {
        constructor: MultiSelect,

        init: function () {
            var that = this,
                ms = this.$element;

            if (ms.next('.ms-container').length === 0) {
                ms.css({position: 'absolute', left: '-9999px'});
                ms.attr('id', ms.attr('id') ? ms.attr('id') : Math.ceil(Math.random() * 1000) + 'multiselect');
                this.$container.attr('id', 'ms-' + ms.attr('id'));
                this.$container.addClass(that.options.cssClass);
                ms.find('option').each(function () {
                    that.generateLisFromOption(this);
                });

                this.$selectionUl.find('.ms-optgroup-label').hide();

                if (that.options.selectableHeader) {
                    that.$selectableContainer.append($('<div/>', {'class': 'ms-header'}).append(that.options.selectableHeader));
                }
                if (that.options.search) {
                    that.$selectableContainer.append($('<div/>', {'class': 'ms-search'}).append(that.$selectableSearch));
                }
                that.$selectableContainer.append($('<div/>', {'class': 'ms-list'}).append(that.$selectableUl));
                if (that.options.selectableFooter) {
                    that.$selectableContainer.append($('<div/>', {'class': 'ms-footer'}).append(that.options.selectableFooter));
                }

                //that.$selectableUl.before(that.$notify);

                if (that.options.selectionHeader) {
                    that.$selectionContainer.append($('<div/>', {'class': 'ms-header'}).append(that.options.selectionHeader));
                }

                if (that.options.search) {
                    that.$selectionContainer.append($('<div/>', {'class': 'ms-search'}).append(that.$selectionSearch));
                }
                that.$selectionContainer.append($('<div/>', {'class': 'ms-list'}).append(that.$selectionUl));
                if (that.options.selectionFooter) {
                    that.$selectionContainer.append($('<div/>', {'class': 'ms-footer'}).append(that.options.selectionFooter));
                }

                that.$container.append(that.$selectableContainer);
                that.$container.append(that.$selectionContainer);
                ms.after(that.$container);

                that.activeMouse(that.$selectableUl);
                that.activeKeyboard(that.$selectableUl);

                var action = that.options.dblClick ? 'dblclick' : 'click';

                that.$selectableUl.on(action, '.ms-elem-selectable', function () {
                    that.select($(this).data('ms-value'));
                });
                that.$selectionUl.on(action, '.ms-elem-selection', function () {
                    that.deselect($(this).data('ms-value'));
                });

                if (that.options.search) {
                    that.$selectableSearch.on('keyup', function () {
                        that.search(this.value, this.dataset.list);
                    });
                    that.$selectionSearch.on('keyup', function () {
                        that.search(this.value, this.dataset.list);
                    });
                }

                that.$container.after(that.$notify);

                that.activeMouse(that.$selectionUl);
                that.activeKeyboard(that.$selectionUl);

                ms.on('focus', function () {
                    that.$selectableUl.focus();
                });
            }

            var selectedValues = ms.find('option:selected').map(function () {
                return $(this).val();
            }).get();

            that.select(selectedValues, 'init');

            if (typeof that.options.afterInit === 'function') {
                that.options.afterInit.call(this, this.$container);
            }
        },

        'search': function (value, list) {
            var that = this, target = '';

            if (list === 'selectable') {
                target = '#' + that.$container.attr('id') + ' .ms-elem-selectable:not(.ms-selected)';
            }
            if (list === 'selection') {
                target = '#' + that.$container.attr('id') + ' .ms-elem-selection.ms-selected';
            }

            if (target) {
                var _options = $(target);
                var numMatchedRows = 0,
                    noresults = true,
                    query = value.toLowerCase().split(' '),
                    val_empty = (value.replace(' ', '').length === 0);

                for (var i = 0, len = _options.length; i < len; i++) {
                    if (val_empty || this.testQuery(query, this.stripHtml(_options[i].innerHTML))) {
                        _options[i].style.display = "";
                        noresults = false;
                        numMatchedRows++;
                    } else {
                        _options[i].style.display = "none"
                    }
                    var group = $(_options[i]).closest('ul.ms-optgroup');
                    if (group.length) {
                        group.show();
                        var $visible_options = group.find('li:visible:not(.ms-optgroup-label)').length;
                        if (!$visible_options) {
                            group.hide();
                        }
                    }
                }
            }
            return this;
        },

        testQuery: function (query, txt) {
            for (var i = 0; i < query.length; i += 1) {
                if (txt.indexOf(query[i]) === -1) {
                    return false;
                }
            }
            return true;
        },

        'stripHtml': function (input) {
            var output = input.replace(new RegExp('<[^<]+\>', 'g'), "");
            output = $.trim(output.toLowerCase());
            return output;
        },

        'generateLisFromOption': function (option, index, $container) {
            var that = this,
                ms = that.$element,
                attributes = "",
                $option = $(option);

            for (var cpt = 0; cpt < option.attributes.length; cpt++) {
                var attr = option.attributes[cpt];

                if (attr.name !== 'value' && attr.name !== 'disabled') {
                    attributes += attr.name + '="' + attr.value + '" ';
                }
            }
            var selectableLi = $('<li ' + attributes + '><span>' + that.escapeHTML($option.text()) + '</span></li>'),
                selectedLi = selectableLi.clone(),
                value = $option.val(),
                elementId = that.sanitize(value);

            selectableLi
                .data('ms-value', value)
                .addClass('ms-elem-selectable')
                .attr('id', elementId + '-selectable');

            selectedLi
                .data('ms-value', value)
                .addClass('ms-elem-selection')
                .attr('id', elementId + '-selection')
                .hide();

            if ($option.attr('disabled') || ms.attr('disabled')) {
                selectedLi.addClass(that.options.disabledClass);
                selectableLi.addClass(that.options.disabledClass);
            }

            var $optgroup = $option.parent('optgroup');

            if ($optgroup.length > 0) {
                var optgroupLabel = $optgroup.attr('label'),
                    optgroupId = that.sanitize(optgroupLabel),
                    $selectableOptgroup = that.$selectableUl.find('#optgroup-selectable-' + optgroupId),
                    $selectionOptgroup = that.$selectionUl.find('#optgroup-selection-' + optgroupId);

                if ($selectableOptgroup.length === 0) {
                    var optgroupContainerTpl = '<li class="ms-optgroup-container"></li>',
                        optgroupTpl = '<ul class="ms-optgroup"><li class="ms-optgroup-label"><span>' + optgroupLabel + '</span></li></ul>';

                    $selectableOptgroup = $(optgroupContainerTpl);
                    $selectionOptgroup = $(optgroupContainerTpl);
                    $selectableOptgroup.attr('id', 'optgroup-selectable-' + optgroupId);
                    $selectionOptgroup.attr('id', 'optgroup-selection-' + optgroupId);
                    $selectableOptgroup.append($(optgroupTpl));
                    $selectionOptgroup.append($(optgroupTpl));
                    if (that.options.selectableOptgroup) {
                        $selectableOptgroup.find('.ms-optgroup-label').on('click', function () {
                            var values = $optgroup.children(':not(:selected, :disabled)').map(function () {
                                return $(this).val();
                            }).get();
                            that.select(values);
                        });
                        $selectionOptgroup.find('.ms-optgroup-label').on('click', function () {
                            var values = $optgroup.children(':selected:not(:disabled)').map(function () {
                                return $(this).val();
                            }).get();
                            that.deselect(values);
                        });
                    }
                    that.$selectableUl.append($selectableOptgroup);
                    that.$selectionUl.append($selectionOptgroup);
                }
                index = index === undefined ? $selectableOptgroup.find('ul').children().length : index + 1;
                selectableLi.insertAt(index, $selectableOptgroup.children());
                selectedLi.insertAt(index, $selectionOptgroup.children());
            } else {
                index = index === undefined ? that.$selectableUl.children().length : index;

                selectableLi.insertAt(index, that.$selectableUl);
                selectedLi.insertAt(index, that.$selectionUl);
            }
        },

        'addOption': function (options) {
            var that = this;

            if (options.value !== undefined && options.value !== null) {
                options = [options];
            }
            $.each(options, function (index, option) {
                if (option.value !== undefined && option.value !== null &&
                    that.$element.find("option[value='" + option.value + "']").length === 0) {
                    var $option = $('<option value="' + option.value + '">' + option.text + '</option>'),
                        $container = option.nested === undefined ? that.$element : $("optgroup[label='" + option.nested + "']"),
                        index = parseInt((typeof option.index === 'undefined' ? $container.children().length : option.index));

                    if (option.optionClass) {
                        $option.addClass(option.optionClass);
                    }

                    if (option.disabled) {
                        $option.prop('disabled', true);
                    }

                    $option.insertAt(index, $container);
                    that.generateLisFromOption($option.get(0), index, option.nested);
                }
            });
        },

        'escapeHTML': function (text) {
            return $("<div>").text(text).html();
        },

        'activeKeyboard': function ($list) {
            var that = this;

            $list.on('focus', function () {
                $(this).addClass('ms-focus');
            }).on('blur', function () {
                $(this).removeClass('ms-focus');
            }).on('keydown', function (e) {
                switch (e.which) {
                    case 40:
                    case 38:
                        e.preventDefault();
                        e.stopPropagation();
                        that.moveHighlight($(this), (e.which === 38) ? -1 : 1);
                        return;
                    case 37:
                    case 39:
                        e.preventDefault();
                        e.stopPropagation();
                        that.switchList($list);
                        return;
                    case 9:
                        if (that.$element.is('[tabindex]')) {
                            e.preventDefault();
                            var tabindex = parseInt(that.$element.attr('tabindex'), 10);
                            tabindex = (e.shiftKey) ? tabindex - 1 : tabindex + 1;
                            $('[tabindex="' + (tabindex) + '"]').focus();
                            return;
                        } else {
                            if (e.shiftKey) {
                                that.$element.trigger('focus');
                            }
                        }
                }
                if ($.inArray(e.which, that.options.keySelect) > -1) {
                    e.preventDefault();
                    e.stopPropagation();
                    that.selectHighlighted($list);
                    return;
                }
            });
        },

        'moveHighlight': function ($list, direction) {
            var $elems = $list.find(this.elemsSelector),
                $currElem = $elems.filter('.ms-hover'),
                $nextElem = null,
                elemHeight = $elems.first().outerHeight(),
                containerHeight = $list.height(),
                containerSelector = '#' + this.$container.prop('id');

            $elems.removeClass('ms-hover');
            if (direction === 1) { // DOWN

                $nextElem = $currElem.nextAll(this.elemsSelector).first();
                if ($nextElem.length === 0) {
                    var $optgroupUl = $currElem.parent();

                    if ($optgroupUl.hasClass('ms-optgroup')) {
                        var $optgroupLi = $optgroupUl.parent(),
                            $nextOptgroupLi = $optgroupLi.next(':visible');

                        if ($nextOptgroupLi.length > 0) {
                            $nextElem = $nextOptgroupLi.find(this.elemsSelector).first();
                        } else {
                            $nextElem = $elems.first();
                        }
                    } else {
                        $nextElem = $elems.first();
                    }
                }
            } else if (direction === -1) { // UP

                $nextElem = $currElem.prevAll(this.elemsSelector).first();
                if ($nextElem.length === 0) {
                    var $optgroupUl = $currElem.parent();

                    if ($optgroupUl.hasClass('ms-optgroup')) {
                        var $optgroupLi = $optgroupUl.parent(),
                            $prevOptgroupLi = $optgroupLi.prev(':visible');

                        if ($prevOptgroupLi.length > 0) {
                            $nextElem = $prevOptgroupLi.find(this.elemsSelector).last();
                        } else {
                            $nextElem = $elems.last();
                        }
                    } else {
                        $nextElem = $elems.last();
                    }
                }
            }
            if ($nextElem.length > 0) {
                $nextElem.addClass('ms-hover');
                var scrollTo = $list.scrollTop() + $nextElem.position().top -
                    containerHeight / 2 + elemHeight / 2;

                $list.scrollTop(scrollTo);
            }
        },

        'selectHighlighted': function ($list) {
            var $elems = $list.find(this.elemsSelector),
                $highlightedElem = $elems.filter('.ms-hover').first();

            if ($highlightedElem.length > 0) {
                if ($list.parent().hasClass('ms-selectable')) {
                    this.select($highlightedElem.data('ms-value'));
                } else {
                    this.deselect($highlightedElem.data('ms-value'));
                }
                $elems.removeClass('ms-hover');
            }
        },

        'switchList': function ($list) {
            $list.blur();
            this.$container.find(this.elemsSelector).removeClass('ms-hover');
            if ($list.parent().hasClass('ms-selectable')) {
                this.$selectionUl.focus();
            } else {
                this.$selectableUl.focus();
            }
        },

        'activeMouse': function ($list) {
            var that = this;

            this.$container.on('mouseenter', that.elemsSelector, function () {
                $(this).parents('.ms-container').find(that.elemsSelector).removeClass('ms-hover');
                $(this).addClass('ms-hover');
            });

            this.$container.on('mouseleave', that.elemsSelector, function () {
                $(this).parents('.ms-container').find(that.elemsSelector).removeClass('ms-hover');
            });
        },

        'refresh': function (options) {
            this.destroy();
            var _options = $.extend({}, this.options, typeof options === 'object' && options);
            this.$element.multiSelect(_options);
        },

        'destroy': function () {
            $("#ms-" + this.$element.attr("id")).remove();
            this.$element.off('focus');
            this.$element.css('position', '').css('left', '');
            this.$element.removeData('multiselect');
        },

        'select': function (value, method) {
            if (typeof value === 'string') {
                value = [value];
            }
            var that = this;

            $.each(value, function (index, val) {
                that._select(val, method);
            });

            if (method === 'init') {
                that._validateMaxOptions(value);
            }
        },

        '_select': function (value, method) {

            var that = this,
                ms = this.$element,
                msId = that.sanitize(value),
                triggerChange = true,
                selectables = this.$selectableUl.find('#' + msId + '-selectable').filter(':not(.' + that.options.disabledClass + ')'),
                selections = this.$selectionUl.find('#' + msId + '-selection').filter(':not(.' + that.options.disabledClass + ')'),
                option = ms.find('option:not(:disabled)').filter(function () {
                    return (this.value == value);
                });


            var maxOptions = this.options.maxOptions;
            var maxOptionsGrp = this.options.maxGroupOptions;

            if (method !== 'init' && (maxOptions !== false || maxOptionsGrp !== false)) {
                var $optgroup = option.parent('optgroup');
                var _selected = ms.find('option:not(:disabled)').filter(':selected').length;
                var _selectedGrp = $optgroup.find('option:selected').length;
                var maxReached = maxOptions <= _selected;
                var maxReachedGrp = maxOptionsGrp <= $optgroup.find('option:selected').length;

                if ((maxOptions && maxReached) || (maxOptionsGrp && maxReachedGrp)) {
                    if (maxOptions && maxOptions == 1) {
                        that.deselect_all();
                    } else if (maxOptionsGrp && maxOptionsGrp == 1) {
                        var $optgroupOptions = $optgroup.find('option:selected');
                        for (var i = 0; i < $optgroupOptions.length; i++) {
                            var _option = $optgroupOptions[i];
                            that.deselect(_option.value);
                        }
                    } else {
                        var maxOptionsText = typeof that.options.maxOptionsText === 'string' ? [that.options.maxOptionsText, that.options.maxOptionsText] : that.options.maxOptionsText;
                        var maxOptionsArr = typeof maxOptionsText === 'function' ? maxOptionsText(maxOptions, maxOptionsGrp) : maxOptionsText;
                        var maxTxt = maxOptionsArr[0].replace('{n}', maxOptions);
                        var maxTxtGrp = maxOptionsArr[1].replace('{n}', maxOptionsGrp);

                        if (maxOptions && maxReached) {
                            that._showError(maxTxt, (_selected <= maxOptions));
                            triggerChange = false;
                        }

                        if (maxOptionsGrp && maxReachedGrp) {
                            that._showError(maxTxtGrp, (_selectedGrp <= maxOptionsGrp));
                            triggerChange = false;
                        }
                    }
                }
            }

            if (triggerChange) {
                that._hideError();
                if (method === 'init') {
                    selectables = this.$selectableUl.find('#' + msId + '-selectable'), selections = this.$selectionUl.find('#' + msId + '-selection');
                }

                if (selectables.length > 0) {
                    selectables.addClass('ms-selected').hide();
                    selections.addClass('ms-selected').show();

                    option.attr('selected', 'selected');

                    that.$container.find(that.elemsSelector).removeClass('ms-hover');

                    var selectableOptgroups = that.$selectableUl.children('.ms-optgroup-container');
                    if (selectableOptgroups.length > 0) {
                        selectableOptgroups.each(function () {
                            var selectablesLi = $(this).find('.ms-elem-selectable');
                            if (selectablesLi.length === selectablesLi.filter('.ms-selected').length) {
                                $(this).find('.ms-optgroup-label').hide();
                            }
                        });

                        var selectionOptgroups = that.$selectionUl.children('.ms-optgroup-container');
                        selectionOptgroups.each(function () {
                            var selectionsLi = $(this).find('.ms-elem-selection');
                            if (selectionsLi.filter('.ms-selected').length > 0) {
                                $(this).find('.ms-optgroup-label').show();
                            }
                        });
                    } else {
                        if (that.options.keepOrder && method !== 'init') {
                            var selectionLiLast = that.$selectionUl.find('.ms-selected');
                            if ((selectionLiLast.length > 1) && (selectionLiLast.last().get(0) != selections.get(0))) {
                                selections.insertAfter(selectionLiLast.last());
                            }
                        }
                    }
                    if (method !== 'init') {
                        ms.trigger('change');
                        that.search(that.$selectionSearch);
                        if (typeof that.options.afterSelect === 'function') {
                            that.options.afterSelect.call(this, value);
                        }
                    }
                }
            }
        },
        '_validateMaxOptions': function (values) {
            var that = this,
                maxOptions = that.options.maxOptions,
                maxOptionsGrp = that.options.maxGroupOptions,
                validate = true;

            if (maxOptions !== false || maxOptionsGrp !== false) {
                var selectedOptions = this.$element.find('option:not(:disabled)').filter(':selected');

                $.each(selectedOptions, function (index, option) {
                    var $optgroup = $(this).parent('optgroup');

                    var _selected = selectedOptions.length;
                    var _selectedGrp = $optgroup.find('option:selected').length;

                    var maxReached = maxOptions < _selected;
                    var maxReachedGrp = maxOptionsGrp < _selectedGrp;

                    if ((maxOptions && maxReached) || (maxOptionsGrp && maxReachedGrp)) {
                        var maxOptionsText = typeof that.options.maxOptionsText === 'string' ? [that.options.maxOptionsText, that.options.maxOptionsText] : that.options.maxOptionsText;
                        var maxOptionsArr = typeof maxOptionsText === 'function' ? maxOptionsText(maxOptions, maxOptionsGrp) : maxOptionsText;
                        var maxTxt = maxOptionsArr[0].replace('{n}', maxOptions);
                        var maxTxtGrp = maxOptionsArr[1].replace('{n}', maxOptionsGrp);

                        if (maxOptions && maxReached) {
                            that._showError(maxTxt);
                            validate = false;
                        }

                        if (maxOptionsGrp && maxReachedGrp) {
                            that._showError(maxTxtGrp);
                            validate = false;
                        }
                    }
                });

                if (validate) {
                    that._hideError();
                }
            }

            return validate;
        },

        '_showError': function (msg, autohide) {
            this._hideError();
            var that = this;
            var _notify = that.$container.next();
            if (!_notify.is('.ms-notify')) {
                _notify = that.$notify;
                that.$container.after(_notify);
            }
            _notify.html(msg).show();
            if (autohide) {
                _notify.delay(5000).fadeOut(function () {
                    _notify.remove();
                });
            }
        },

        '_hideError': function () {
            this.$container.next('.ms-notify').remove();
        },

        'deselect': function (value) {
            if (typeof value === 'string') {
                value = [value];
            }

            var that = this,
                ms = this.$element,
                msIds = $.map(value, function (val) {
                    return (that.sanitize(val));
                }),
                selectables = this.$selectableUl.find('#' + msIds.join('-selectable, #') + '-selectable'),
                selections = this.$selectionUl.find('#' + msIds.join('-selection, #') + '-selection').filter('.ms-selected').filter(':not(.' + that.options.disabledClass + ')'),
                options = ms.find('option').filter(function () {
                    return ($.inArray(this.value, value) > -1);
                });

            if (selections.length > 0) {
                selectables.removeClass('ms-selected').show();
                selections.removeClass('ms-selected').hide();
                options.removeAttr('selected');

                that.$container.find(that.elemsSelector).removeClass('ms-hover');

                var selectableOptgroups = that.$selectableUl.children('.ms-optgroup-container');
                if (selectableOptgroups.length > 0) {
                    selectableOptgroups.each(function () {
                        var selectablesLi = $(this).find('.ms-elem-selectable');
                        if (selectablesLi.filter(':not(.ms-selected)').length > 0) {
                            $(this).find('.ms-optgroup-label').show();
                        }
                    });

                    var selectionOptgroups = that.$selectionUl.children('.ms-optgroup-container');
                    selectionOptgroups.each(function () {
                        var selectionsLi = $(this).find('.ms-elem-selection');
                        if (selectionsLi.filter('.ms-selected').length === 0) {
                            $(this).find('.ms-optgroup-label').hide();
                        }
                    });
                }
                that._validateMaxOptions(value);
                ms.trigger('change');
                that.search(that.$selectableSearch);
                if (typeof that.options.afterDeselect === 'function') {
                    that.options.afterDeselect.call(this, value);
                }
            }
        },

        'select_all': function () {
            var ms = this.$element,
                values = ms.val();

            ms.find('option:not(":disabled")').attr('selected', 'selected');
            this.$selectableUl.find('.ms-elem-selectable').filter(':not(.' + this.options.disabledClass + ')').addClass('ms-selected').hide();
            this.$selectionUl.find('.ms-optgroup-label').show();
            this.$selectableUl.find('.ms-optgroup-label').hide();
            this.$selectionUl.find('.ms-elem-selection').filter(':not(.' + this.options.disabledClass + ')').addClass('ms-selected').show();
            this.$selectionUl.focus();
            ms.trigger('change');
            if (typeof this.options.afterSelect === 'function') {
                var selectedValues = $.grep(ms.val(), function (item) {
                    return $.inArray(item, values) < 0;
                });
                this.options.afterSelect.call(this, selectedValues);
            }
        },

        'deselect_all': function () {
            var ms = this.$element,
                values = ms.val();

            ms.find('option').removeAttr('selected');
            this.$selectableUl.find('.ms-elem-selectable').removeClass('ms-selected').show();
            this.$selectionUl.find('.ms-optgroup-label').hide();
            this.$selectableUl.find('.ms-optgroup-label').show();
            this.$selectionUl.find('.ms-elem-selection').removeClass('ms-selected').hide();
            this.$selectableUl.focus();
            ms.trigger('change');
            if (typeof this.options.afterDeselect === 'function') {
                this.options.afterDeselect.call(this, values);
            }
        },

        sanitize: function (value) {
            var hash = 0, i, character;
            if (value.length == 0) return hash;
            var ls = 0;
            for (i = 0, ls = value.length; i < ls; i++) {
                character = value.charCodeAt(i);
                hash = ((hash << 5) - hash) + character;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        }
    };

    /* MULTISELECT PLUGIN DEFINITION */

    $.fn.multiSelect = function () {
        var option = arguments[0],
            args = arguments;

        return this.each(function () {
            var $this = $(this);
            if ($this.prop("multiple")) {
                var data = $this.data('multiselect'),
                    options = $.extend({}, $.fn.multiSelect.defaults, $this.data(), typeof option === 'object' && option);

                if (!data) {
                    $this.data('multiselect', (data = new MultiSelect(this, options)));
                }

                if (typeof option === 'string') {
                    data[option](args[1]);
                } else {
                    data.init();
                }
            }
        });
    };

    $.fn.multiSelect.defaults = {
        keySelect: [32, 13],
        maxOptions: false,
        maxGroupOptions: false,
        maxOptionsText: function (numAll, numGroup) {
            return [
                (numAll == 1) ? 'Limit reached ({n} item max)' : 'Limit reached ({n} items max)',
                (numGroup == 1) ? 'Group limit reached ({n} item max)' : 'Group limit reached ({n} items max)'
            ];
        },
        selectableHeader: false,
        selectionHeader: false,
        selectableFooter: false,
        selectionFooter: false,
        selectableOptgroup: false,
        disabledClass: 'disabled',
        dblClick: false,
        keepOrder: false,
        search: false,
        cssClass: '',
        afterInit: null,
        afterSelect: null,
        afterDeselect: null,
    };

    $.fn.multiSelect.Constructor = MultiSelect;

    $.fn.insertAt = function (index, $parent) {
        return this.each(function () {
            if (index === 0) {
                $parent.prepend(this);
            } else {
                $parent.children().eq(index - 1).after(this);
            }
        });
    };

}(window.jQuery);
