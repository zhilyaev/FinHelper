// Дефолтные настройки
const defaults = {
    prior: 1,
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
/* Remove like ListArray */
Object.getPrototypeOf(localStorage).safeRemove = function (index) {
    // todo vonvee сделай ебучий алгоритм
    // see https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
    for (i = index; i < localStorage.length; i++) {
        localStorage[i] = localStorage[i + 1]
    }
    delete localStorage[localStorage.length - 1]
};
// Первый раз запустили приложуху
if (localStorage.length === 0) localStorage[0] = JSON.stringify(defaults);
var canDel = false;
var app = new Vue({
    el: "#app",
    data: {
        current: JSON.parse(localStorage[0]),
        goals: localStorage
    },
    computed: {
        resultPercent: function () {
            // Разница месяцев
            var aimTime = Date.diff(new Date(), new Date(this.current.date))[1];
            var period = 12;
            var isPercentSimple = true;
            if (isPercentSimple) {
                var moneyWithoutPercents = this.current.rightNow + this.current.gain * aimTime;
                var numberOfFullPeriods = aimTime / period;
                var profit = (this.current.dream - moneyWithoutPercents) / numberOfFullPeriods;
                var result = ((parseInt(profit) + parseInt(moneyWithoutPercents)) / moneyWithoutPercents - 1) * 100
            }
            if (0 < result < 50) {
                //calculateDoc(this.inCom, resultPercent)
            }
            if (result < 0) {
                result = "Цель выполнится накоплением без вкладов."
            }
            if (result > 50) {
                result = "Выполнение цели недостижимо в данные сроки."
            }
            return result;
        }
    },
    watch: {
        current: {
            handler: function (newVal) {
                this.goals[this.current.prior - 1] = JSON.stringify(this.current);
                console.log("save=>" + JSON.stringify(this.current));
            },
            deep: true
        }
    },
    methods: {
        creator: function () {
            this.current = JSON.parse(JSON.stringify(defaults));
            this.current.prior = this.goals.length + 1;
            this.goals[this.goals.length] = JSON.stringify(this.current);
        },
        deleter: function () {
            if (this.goals.length === 1) {
                alert("Нельзя удалить все цели");
            } else canDel = true;
        },
        setActive: function (key) {
            /* Костыльный велоспиед отлова вложенного события */
            if (canDel) {
                canDel = false;
                // Переключатся на ближайший слева
                this.current = JSON.parse(this.goals[key - 2]);
                // Удалить последний элемент очень просто!
                if (key === this.goals.length) {
                    //console.log("Простое удаление");
                    delete this.goals[key - 1];
                }
                // Удаление со сдвигом // todo @Vonvee
                else {
                    this.goals.safeRemove(key - 1);
                }
            }
            else this.current = JSON.parse(this.goals[key - 1]);
        }
    }
});