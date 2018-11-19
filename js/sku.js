$(function () {
    sku = {
        createTable: function (jsonData) {
            var specArray = new Array();// 盛放每组选中的CheckBox值的对象
            var titleArray = new Array();// 表格标题数组
            var titleIndex = 0;//规格项目下标
            var columnArray = new Array(); // 指定列，用来合并哪些列
            sku.mergeTable();//合并表格
            //遍历规格
            $(".spec-group").each(function (i, val) {
                columnArray.push(i);
                //checkbox选中的个数
                var checkedLength = $(val).find("input[type=checkbox]:checked").length;
                if (checkedLength > 0) {
                    //获取标题
                    titleArray[titleIndex] = $(val).attr("spName");
                    //规格id
                    var spId = $(val).attr("spId");
                    //规格名称
                    var spName = $(val).attr("spName");
                    var specValueArray = new Array();//存放规格值的数组
                    //循环,判断获取每个规格中选中的值
                    $(val).find("input[type=checkbox]:checked").each(function (j, specVal) {
                        //创建规格对象
                        var specUnit = "";
                        if ($(specVal).attr("flag") == 1) {
                            specUnit = $(specVal).attr("spValueName").trim();
                        }
                        var spec = {
                            spId: spId,
                            spName: spName,
                            specValueId: $(specVal).val().trim(),
                            specValueName: $(specVal).attr("spValueName").trim(),
                            specInfo: spName + ":" + $(specVal).attr("spValueName").trim() + " ",
                            specUnit: specUnit
                        };
                        //将规格值放入数组中
                        specValueArray[j] = spec;
                    });
                    // 把每个规格的选中项放入数组specArray[arrayLen]
                    specArray[titleIndex] = specValueArray;
                    titleIndex++;
                }
            });
            var arr = sku.getSkuTr(specArray);
            //开始生成表格
            if (typeof arr != 'undefined') {
                $('#createTable').html('');
                var table = $('<table class="table table-bordered" style="border-collapse: collapse;"></table>');
                table.appendTo($('#createTable'));
                var thead = $('<thead></thead>');
                thead.appendTo(table);
                var trHead = $('<tr></tr>');
                trHead.appendTo(thead);

                //创建表头
                var str = "";
                $.each(titleArray, function (index, item) {
                    str += '<th width="10%">' + item + '</th>';
                });
                str += "<th>售价</th> <th>库存</th>";
                trHead.append(str);
                var tbody = $('<tbody></tbody>');
                tbody.appendTo(table);

                //创建行
                $.each(arr, function (index, item) {
                    var specValItem = item.specValueName.split(",");
                    var tr = $('<tr name="skuDo" sp-id=' + item.spId + ' sp-name=' + item.spName + ' sp-val-name=' + item.specValueName + ' sp-val-id="' + item.specValueId + '" value="' + item.specValueId + '"></tr>');
                    tr.appendTo(tbody);
                    var str = '';
                    $.each(specValItem, function (i, data) {
                        str += '<td>' + data + '</td>';
                    });
                    //console.log(jsonData);
                    var flag = false;
                    $.each(jsonData, function (index, vsb) {
                        if (vsb.Properties === item.specValueName) {
                            str += '<td><input type="number" class="form-control" value="' + vsb.Price + '" placeholder="售价" /></td>';
                            str += '<td><input type="number" class="form-control" placeholder="库存" value="' + vsb.Count + '" /></td>';
                            flag = true;
                        }
                    });

                    if (!flag) {
                        str += '<td><input type="number" class="form-control" placeholder="售价" /></td>';
                        str += '<td><input type="number" class="form-control" placeholder="库存" value="1" /></td>';
                    }

                    tr.append(str);
                });

                //结束创建Table表
                columnArray.pop(); //删除数组中最后一项
                //合并单元格
                $(table).mergeCell({
                    // 目前只有cols这么一个配置项, 用数组表示列的索引,从0开始
                    cols: columnArray
                });
            } else {
                $('#createTable').html('');
            }
        },
        getSkuTr: function (arr) {
            var a = 1;
            for (var r = 0; r < arr.length; r++) {
                a *= arr[r].length;
            }
            var newArray = arr[0];
            for (var m = 1; m < arr.length; m++) {
                var arr2 = arr[m];
                newArray = sku.dosku(newArray, arr2);
            }
            return newArray;
        },
        dosku: function (arr, arr2) {
            var a = arr.length;
            var b = arr2.length;
            var newArr = new Array(a * b);
            var q = 0;
            for (var i = 0; i < arr.length; i++) {
                for (var j = 0; j < arr2.length; j++) {
                    var spec = {
                        spName: arr[i].spName + ',' + arr2[j].spName,
                        specValueId: arr[i].specValueId + ',' + arr2[j].specValueId,
                        specValueName: arr[i].specValueName + ',' + arr2[j].specValueName,
                        specInfo: arr[i].specInfo + arr2[j].specInfo + " ",

                    };
                    newArr[q] = spec;
                    q++;
                }
            }
            return newArr;
        },
        GetSku: function () {
            var skuArray = new Array();
            $.each($("tr[name='skuDo']"), function (index, value) {
                var obj = {
                    Price: 0,
                    Count: 1,
                    Properties: "",
                    Category:""
                };
                var i = 0;
                $.each($(value).find("td"), function (index2, val) {
                    if ($(val).find("input").length > 0) {
                        var da = $(val).find("input").val();
                        if (i == 0)
                            obj.Price = da;
                        else
                            obj.Count = da;
                        i++;
                    }
                    else {
                        var th = $(".table-bordered").find("thead").find("tr").find("th")[index2].innerHTML;
                        obj.Category += th + ",";
                        obj.Properties += val.innerHTML + ",";
                    }
                });
                obj.Category = obj.Category.substring(0, obj.Category.length - 1);
                obj.Properties = obj.Properties.substring(0, obj.Properties.length - 1);
                skuArray.push(obj);
            });
            return skuArray;
        },
        mergeTable: function () {
            $.fn.mergeCell = function (options) {
                return this.each(function () {
                    var cols = options.cols;
                    for (var i = cols.length - 1; cols[i] != undefined; i--) {
                        mergeCell($(this), cols[i]);
                    }
                    dispose($(this));
                });
            };

            function mergeCell($table, colIndex) {
                $table.data('col-content', ''); // 存放单元格内容
                $table.data('col-rowspan', 1); // 存放计算的rowspan值 默认为1
                $table.data('col-td', $()); // 存放发现的第一个与前一行比较结果不同td(jQuery封装过的), 默认一个"空"的jquery对象
                $table.data('trNum', $('tbody tr', $table).length); // 要处理表格的总行数, 用于最后一行做特殊处理时进行判断之用
                // 进行"扫面"处理 关键是定位col-td, 和其对应的rowspan
             ;
            }

            // 同样是个private函数 清理内存之用
            function dispose($table) {
                $table.removeData();
            }
        }
    };
});