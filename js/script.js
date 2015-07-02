function Matrix(matrix) {
    var self = this;

    self.data = ko.observableArray(matrix);
    self.rows = ko.computed(function () {
        return self.data().length;
    });

    self.columns = ko.computed(function () {
        return self.data()[0]().length;
    });
}

function MatrixViewModel() {
    var self = this;
    self.firstMatrix = new Matrix([
        ko.observableArray([1, 2]),
        ko.observableArray([4, 5]),
        ko.observableArray([7, 8]),
        ko.observableArray([0, 9])
    ]);

    self.secondMatrix = new Matrix([
        ko.observableArray([1, 2, 3, 4]),
        ko.observableArray([5, 6, 7, 8])
    ]);

    self.selectedMatrix = ko.observable();
    self.matrices = [
        {
            id: 0,
            title: 'A'
        },
        {
            id: 1,
            title: 'B'
        }
    ];
};

ko.applyBindings(new MatrixViewModel());
