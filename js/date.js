// Thanks for StackOverFlow

Date.prototype.yyyymmdd = function(literal) {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
        (mm>9 ? '' : '0') + mm,
        (dd>9 ? '' : '0') + dd
    ].join(literal);
};

Date.diff = function (date1, date2) {
    var years = date2.getFullYear() - date1.getFullYear();
    var months = years * 12 + date2.getMonth() - date1.getMonth();
    var days = date2.getDate() - date1.getDate();
    years -= date2.getMonth() < date1.getMonth();
    months -= date2.getDate() < date1.getDate();
    days += days < 0 ? new Date(date2.getFullYear(), date2.getMonth() - 1, 0).getDate() + 1 : 0;
    return [years, months, days];
};