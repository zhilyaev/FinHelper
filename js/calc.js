// Дефолтные настройки
const defaults = {
    cy: '₽',
    name: 'Цель',
    // (Today + 1 year).parse("YYYY-mm-dd")
    date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).yyyymmdd("-"),
    dream: "",

    /* Базовые */
    inCom: "",
    expense: "",
    gain: 0,

    /* Проценты */
    broker: 0,
    brokerPercent: 70,
    pillow: 0,
    pillowPercent: 20,
    reserve: 0,
    reservePercent: 10,

    /* Прямо сейчас */
    rightNow: "",
    pillowRightNow: "",
    reserveRightNow: ""

};
/* Str[] to goal[] */
Object.getPrototypeOf(localStorage).asArrayOfObj = function () {
    var res = [];
    for (var i = 0; i < localStorage.length; i++) {
        try {
            res.push(JSON.parse(localStorage[i]));
        } catch (e) {
            console.log("Error index in localStorage");
        }
    }

    return res;
};
/*Calc table data*/
Object.getPrototypeOf(localStorage).calculateTableData = function (aims) {
    RecalculatePerc = function () {
        percentCorrelation.forEach(function (item, i, array) {
            var sum = array.reduce(function (a, b) {
                return a + b;
            }, 0)
            array[i] = item / sum
        });
    }

    AddRemainder = function (remainder, row) {
        row.broker += remainder * percentCorrelation.brokerPerc
        row.pillow += remainder * percentCorrelation.pillowPerc
        row.reserved += remainder * percentCorrelation.reservedPerc
        //TODO: Please make it return null, and work directly with row data as link in C++ or ref in C#
        return row
    }

    //Todo: @DIAMON refactor to not class
    class Row {
        constructor(data, totalMoney, broker, pillow, reserved, currentAim) {
            this.data = data,
                this.totalMoney = totalMoney,
                this.broker = broker,
                this.pillow = pillow,
                this.reserved = reserved,
                this.currentAim = currentAim
        }
    }

    var totalMonths = 0
    for (var i = 0; i < aims.size; i++) {
        totalMonths += aims.totalMonths;
    }

    var resultData = []

    for (var j = 0; j < aims.size; j++) {
        var percentCorrelation = {
            //Todo(ez): get from data fields
            brokerPerc: 0.7,
            pillowPerc: 0.2,
            reservedPerc: 0.1
        }
        var aimExtra = 0
        //Todo: get from data fields
        resultData.add(new Row(date, brokerNow + pillowNow + reservedNow, brokerNow, pillowNow, reservedNow, 1))
        for (var i = 1; i < aims[j].totalMonths; i++) {
            var row = resultData[i - 1]

            if (aimExtra != 0) {
                gain += aimExtra
                aimExtra = 0
            }
            row.data.setMonth(row.data.getMonth() + 1)
            row.broker += gain * percentCorrelation.brokerPerc
            row.pillow += gain * percentCorrelation.pillowPerc
            row.reserved += gain * percentCorrelation.reservedPerc


            if (row.pillow > pillowMax) {
                percentCorrelation.pillowPerc = 0
                RecalculatePerc()
                var remainder = row.pillow - pillowMax
                row.pillow = pillowMax
                row = AddRemainder(remainder, row)
            }
            if (row.reserved > reservedMax) {
                percentCorrelation.reservedPerc = 0
                RecalculatePerc()
                var remainder = row.reserved - reservedMax
                row.reserved = reservedMax
                row = AddRemainder(remainder, row)
            }

            row.totalMoney += gain
            if (row.totalMoney != (row.broker + row.pillow + row.reserved)) {
                throw Error("Бюджет не сошёлся!")
            }

            //Todo: make recalculate for different aims
            if (aim[j].dream > row.totalMoney) {
                aimExtra = aim[j].dream > row.totalMoney
            }
            resultData.add(row)
        }

    }
    return 0
}

/* Remove like ListArray */
Object.getPrototypeOf(localStorage).safeRemove = function (index) {
    for (var i = index; i < localStorage.length; i++) {
        localStorage[i] = localStorage[i + 1]
    }
    delete localStorage[localStorage.length - 1];
};
// Первый раз запустили приложуху
if (localStorage.length === 0) localStorage[0] = JSON.stringify(defaults);
var canDel = false;
var app = new Vue({
    el: "#app",
    data: {
        current: JSON.parse(localStorage[0]),
        // Really shit
        goals: localStorage,
        // current index
        i: 0
    },
    computed: {
        resultPercent: function () {
            // Разница месяцев
            var aimTime = Date.diff(new Date(), new Date(this.current.date))[1];

            var period = 12;
            var moneyWithoutPercents = this.current.rightNow + this.current.gain * aimTime;
            var numberOfFullPeriods = aimTime / period;
            var profit = (this.current.dream - moneyWithoutPercents) / numberOfFullPeriods;
            var result = ((parseInt(profit) + parseInt(moneyWithoutPercents)) / moneyWithoutPercents - 1) * 100;

            if (result < 0) {
                result = "Цель выполнится накоплением без вкладов."
            } else if (result > 50) {
                result = "Выполнение цели недостижимо в данные сроки."
            }

            // Fix
            if (isNaN(result)) {
                result = 0
            }
            return result;
        }
    },
    watch: {
        current: {
            handler: function () {
                this.goals[this.i] = JSON.stringify(this.current);
                //console.log("save["+this.i+"] : "+JSON.stringify(this.current));
            },
            deep: true
        }
    },
    methods: {
        creator: function () {
            this.current = JSON.parse(JSON.stringify(defaults));
            this.goals[this.goals.length] = JSON.stringify(this.current);
            this.i = this.goals.length - 1;
        },
        deleter: function () {
            canDel = true;
        },
        setActive: function (key) {
            // Было нажато удаление
            if (canDel) {
                canDel = false;
                this.goals.safeRemove(key);
                // Смещаем
                key = 0;
            }

            this.current = JSON.parse(this.goals[key]);
            this.i = key;

        }
    }
});

// Меняем местами
$("#prior").change(function () {
    var t = app.goals[this.value];
    app.goals[this.value] = app.goals[app.i];
    app.goals[app.i] = t;

    app.i = this.value;
});