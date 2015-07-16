ko.extenders.numeric = function (target, range) {
    var result = ko.pureComputed({
        read: target,
        write: function (newValue) {
            var current = target(),
                min     = range[0],
                max     = range[1],
                valueToWrite,
                newHandledValue;

            if (newValue === '-' || newValue === '0-') {
                valueToWrite = '-'
            } else if (newValue === '' || isNaN(newValue)) {
                valueToWrite = '';
            } else {
                newHandledValue = parseInt(+newValue);
                valueToWrite = newHandledValue > 0 ? Math.min(max, newHandledValue) : Math.max(min, newHandledValue)
            }

            if (valueToWrite !== current) {
                target(valueToWrite);
            }
            else {
                if (newValue !== current) {
                    target.notifySubscribers(valueToWrite);
                }
            }
        }
    }).extend({notify: 'always'});

    return result;
};

function Cell(n) {
    var self = this;
    self.value = ko.observable(n).extend({numeric: [-10, 10]});
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
        var result  = [],
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
    self.enableEditing = function () {
        self.editing(true);
    };

    self.disableEditing = function () {
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
        return self.selectedMatrix().rows() < 3;
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
        var firstMatrix  = self.firstMatrix().transpose(),
            secondMatrix = self.secondMatrix().toArray(),
            rows         = self.secondMatrix().rows(),
            columns      = self.firstMatrix().columns();

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

var viewModel = new MatrixViewModel();
ko.applyBindings(viewModel);


$('input').iCheck().on('ifChecked', function () {
    viewModel.selectedMatrixId(this.value);
});