function Cell (n) {
    var self = this;
    self.value = ko.observable(n);

    self.clear = function () {
        self.value('');
    }
}

function Row (n) {
    var self = this;
    self.cells = ko.observableArray([]);
    for (var i = 0; i < n; i++) {
        self.cells.push(new Cell(''));
    }

    self.addItem = function () {
        self.cells.push(new Cell(''));
    };

    self.removeItem = function () {
        self.cells.pop();
    };

    self.clear = function () {
        ko.utils.arrayForEach(self.cells(), function (cell){
            cell.clear();
        });
    };
}

function Matrix(m, n) {
    var self = this;

    self.data = ko.observableArray([]);
    for (var i = 0; i < n; i++) {
        self.data.push(new Row(m));
    }

    self.rows = ko.computed(function () {
        return self.data().length;
    });

    self.columns = ko.computed(function () {
        return self.data()[0].cells().length;
    });

    self.addColumn = function () {
        ko.utils.arrayForEach(self.data(), function(item){
            item.addItem();
        });
    };

    self.removeColumn = function () {
        ko.utils.arrayForEach(self.data(), function(item){
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
        ko.utils.arrayForEach(self.data(), function(item){
            item.clear();
        });
    };
}

function MatrixViewModel() {
    var self = this;

    self.firstMatrix = ko.observable(new Matrix(2,4));
    self.secondMatrix = ko.observable(new Matrix(4,3));

    self.selectedMatrixId = ko.observable(0);
    self.selectedMatrix = ko.computed(function () {
        return (self.selectedMatrixId() == 0) ? self.firstMatrix() : self.secondMatrix()
    });

    self.matrices = [
        {
            id: 0,
            title: 'Матрица A'
        },
        {
            id: 1,
            title: 'Матрица B'
        }
    ];

    self.swap = function () {
        var tmp = self.firstMatrix();

        self.firstMatrix(self.secondMatrix());
        self.secondMatrix(tmp);
    };

    self.clear = function () {
        self.firstMatrix().clear();
        self.secondMatrix().clear();
    };

};

ko.applyBindings(new MatrixViewModel());
