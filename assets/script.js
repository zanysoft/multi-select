function createOptions(num, group_items) {
    var elm = $("#multiSelect");
    var vals = elm.val(), grp = 1;
    var _group = $("<optgroup label='Group 1'/>");
    elm.html('');
    for (var i = 1; i <= num; i++) {
        if (group_items) {
            _group.append($("<option>", {'val': i, 'text': "Option " + i}).attr('selected', vals.includes('' + i) > 0));
            if (i > 1 && i % group_items == 0) {
                elm.append(_group);
                _group = $("<optgroup label='Group " + (++grp) + "'/>");
            }
            if (i == num && _group.length && _group.children().length) {
                elm.append(_group.children());
            }
        } else {
            elm.append($("<option>", {'val': i, 'text': "Option " + i}).attr('selected', vals.includes('' + i) > 0));
        }
    }
}

$(function () {
    $('.form-group a').popover({
        trigger: 'hover',
    });

    createOptions(15);

    var _config = {
        maxOptions: 4,
        maxGroupOptions: false,
        selectableOptgroup: false,
        search: true
    }

    $('#multiSelect').multiSelect(_config);

    $("#filter").on('change keyup', '.form-control', function () {
        var _name = $(this).attr('name');
        var _val = $(this).val();
        if (!_val || _val == 0) {
            _val = $(this).data('default');
        }
        _config[_name] = _val;
        if ($("#selectableOptgroup").is(':checked') || $("#maxGroupOptions").val() > 0) {
            createOptions(15, 4);
        } else {
            createOptions(15);
        }
        $('#multiSelect').multiSelect('refresh', _config);
    });

    $("#filter").on('click', '[type="checkbox"]', function () {
        var _name = $(this).attr('name');
        _config[_name] = $(this).is(":checked") ? $(this).val() : $(this).data('default');
        if ($("#selectableOptgroup").is(':checked') || $("#maxGroupOptions").val() > 0) {
            createOptions(15, 4);
        } else {
            createOptions(15);
        }
        $('#multiSelect').multiSelect('refresh', _config);
    });
});
