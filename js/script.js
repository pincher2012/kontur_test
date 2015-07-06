function Cell(n) {
    var self = this;
    self.value = ko.observable(n);
    self.editing = ko.observable(false);
    self.clear = function () {
        self.value('');
    };
}

function Row(n) {
    var self = this;

    if (n instanceof Array) {
        self.cells = ko.observableArray(n);
    } else {
        self.cells = ko.observableArray([]);
        for (var i = 0; i < n; i++) {
            self.cells.push(new Cell(''));
        }
    }

    self.addItem = function () {
        self.cells.push(new Cell(''));
    };

    self.removeItem = function () {
        self.cells.pop();
    };

    self.clear = function () {
        ko.utils.arrayForEach(self.cells(), function (cell) {
            cell.clear();
        });
    };

    self.toArray = function () {
        var result = [];
        ko.utils.arrayForEach(self.cells(), function (cell) {
            result.push(cell.value());
        });

        return result;
    };
}

function Matrix(m, n) {
    var self = this;

    if (m instanceof Array) {
        self.data = ko.observableArray(m);
    } else {
        self.data = ko.observableArray([]);
        for (var i = 0; i < n; i++) {
            self.data.push(new Row(m));
        }
    }

    self.rows = ko.computed(function () {
        return self.data().length;
    });

    self.columns = ko.computed(function () {
        return self.data()[0].cells().length;
    });

    self.addColumn = function () {
        ko.utils.arrayForEach(self.data(), function (item) {
            item.addItem();
        });
    };

    self.removeColumn = function () {
        ko.utils.arrayForEach(self.data(), function (item) {
            item.removeItem();
        });
    };

    self.addRow = function () {
        self.data.push(new Row(self.columns()));
    };

    self.removeRow = function () {
        self.data.pop();
    };

    self.clear = function () {
        ko.utils.arrayForEach(self.data(), function (item) {
            item.clear();
        });
    };

    self.getColumn = function (i) {
        var result = [];
        ko.utils.arrayForEach(self.data(), function (item) {
            result.push(item.cells()[i].value());
        });
        return result;
    };

    self.transpose = function () {
        var result = [],
            columns = self.columns();
        for (var i = 0; i < columns; i++) {
            result.push(self.getColumn(i));
        }

        return result;
    };

    self.toArray = function () {
        var result = [];
        ko.utils.arrayForEach(self.data(), function (item) {
            result.push(item.toArray());
        });
        return result;
    }
}

function MatrixViewModel() {
    var self = this;

    self.firstMatrix = ko.observable(new Matrix(3, 2));
    self.secondMatrix = ko.observable(new Matrix(2, 4));
    self.resultMatrix = ko.observable(new Matrix(self.firstMatrix().columns(), self.secondMatrix().rows()));

    self.selectedMatrixId = ko.observable(1);
    self.selectedMatrix = ko.computed(function () {
        return (self.selectedMatrixId() == 0) ? self.firstMatrix() : self.secondMatrix()
    });

    self.editing = ko.observable(false);
    self.enableEditing = function (){
        self.editing(true);
    };

    self.disableEditing = function (){
        self.editing(false);
    };
    self.isComputable = ko.computed(function () {
        return self.firstMatrix().rows() == self.secondMatrix().columns();
    });

    // ie8
    self.isMaxColumns = ko.computed(function () {
        return self.selectedMatrix().columns() > 9;
    });

    self.isMinColumns = ko.computed(function () {
        return self.selectedMatrix().columns() < 3;
    });

    self.isMaxRows = ko.computed(function () {
        return self.selectedMatrix().rows() > 9;
    });

    self.isMinRows = ko.computed(function () {
        return self.selectedMatrix().rows() <3;
    });


    self.cell = new Cell(1);
    self.matrices = [
        {
            id: 1,
            title: 'Матрица A'
        },
        {
            id: 0,
            title: 'Матрица B'
        }
    ];

    self.swap = function () {
        var tmp = self.firstMatrix();

        self.firstMatrix(self.secondMatrix());
        self.secondMatrix(tmp);
        reinitResultMatrix();
    };

    self.clear = function () {
        self.firstMatrix().clear();
        self.secondMatrix().clear();
        reinitResultMatrix();
    };

    self.addColumn = function () {
        self.selectedMatrix().addColumn();
        reinitResultMatrix();
    };

    self.removeColumn = function () {
        self.selectedMatrix().removeColumn();
        reinitResultMatrix();
    };

    self.addRow = function () {
        self.selectedMatrix().addRow();
        reinitResultMatrix();
    };

    self.removeRow = function () {
        self.selectedMatrix().removeRow();
        reinitResultMatrix();
    };


    self.compute = function () {
        var firstMatrix = self.firstMatrix().transpose(),
            secondMatrix = self.secondMatrix().toArray(),
            rows = self.secondMatrix().rows(),
            columns = self.firstMatrix().columns();

        var data = [],
            row;
        for (var i = 0; i < rows; i++) {
            row = [];
            for (var j = 0; j < columns; j++) {
                row.push(multiplieArrays(firstMatrix[j], secondMatrix[i]));
            }
            data.push(new Row(row));
        }

        self.resultMatrix(new Matrix(data));
    };

    var multiplieArrays = function (a, b) {
        var sum = 0;
        for (var i = 0; i < a.length; i++) {
            sum += a[i] * b[i];
        }
        return new Cell(sum);
    };

    var reinitResultMatrix = function () {
        var result = new Matrix(self.firstMatrix().columns(), self.secondMatrix().rows());
        self.resultMatrix(result);
    }
};

ko.bindingHandlers.numeric = {
    init: function (element, valueAccessor) {
        $(element).on("keydown", function (event) {
            var value = parseInt(ko.unwrap(valueAccessor()) + String.fromCharCode(event.keyCode));
            // Allow: backspace, delete, tab, escape, and enter
            if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 ||
                    // Allow: Ctrl+A
                (event.keyCode == 65 && event.ctrlKey === true) ||
                    // Allow: F1-F12
                (event.keyCode >= 112 && event.keyCode <= 123) ||
                    // Allow: home, end, left, right
                (event.keyCode >= 35 && event.keyCode <= 39)) {
                // let it happen, don't do anything
                return;
            }
            else if (ko.unwrap(valueAccessor()) == '' && (event.keyCode == 109 || event.keyCode == 189)) {
                return;
            }
            else {
                // Ensure that it is a number and stop the keypress
                if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                    event.preventDefault();
                }

                if (value > 10) {
                    element.value = 10;
                    event.preventDefault();
                }

                if (value < -10) {
                    element.value = -10;
                    event.preventDefault();
                }

                if (value >= -10 && value <= 10) {
                    element.value = value;
                    event.preventDefault();
                }
            }
        });
    }
};


ko.applyBindings(new MatrixViewModel());


$('input').iCheck();
