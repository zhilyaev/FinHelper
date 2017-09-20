// Дефолтные настройки
const defaults ={
    cy:'₽',
    name:'Цель',
    // (Today + 1 year).parse("YYYY-mm-dd")
    date:new Date(new Date().setFullYear(new Date().getFullYear()+1)).yyyymmdd("-"),
    dream:"",

    /* Базовые */
    inCom:"",
    expense:"",
    gain:0,

    /* Проценты */
    broker:0,
    brokerPercent:70,
    pillow:0,
    pillowPercent:20,
    reserve:0,
    reservePercent:10,

    /* Прямо сейчас */
    rightNow:"",
    pillowRightNow:"",
    reserveRightNow:""

};
/* Str[] to goal[] */
Object.getPrototypeOf(localStorage).asArrayOfObj = function () {
    var res = [];
    for (var i=0;i<localStorage.length;i++){
        try {
            res.push(JSON.parse(localStorage[i]));
        }catch (e){
            console.log("Error index in localStorage");
        }
    }

    return res;
};
/* Remove like ListArray */
Object.getPrototypeOf(localStorage).safeRemove = function (index) {
    for(var i = index; i < localStorage.length; i++){
        localStorage[i] = localStorage[i+1]
    }
    delete localStorage[localStorage.length-1];
};
// Первый раз запустили приложуху
if(localStorage.length===0) localStorage[0] = JSON.stringify(defaults);
var canDel = false;
var app = new Vue({
    el:"#app",
    data:{
        current:JSON.parse(localStorage[0]),
        // Really shit
        goals: localStorage,
        // current index
        i: 0
    },
    computed:{
        resultPercent:function () {
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
            if(isNaN(result)){result=0}
            return result;
        }
    },
    watch: {
        current:{
            handler:function () {
                this.goals[this.i]=JSON.stringify(this.current);
                //console.log("save["+this.i+"] : "+JSON.stringify(this.current));
            },
            deep:true
        }
    },
    methods: {
        creator: function () {
            this.current = JSON.parse(JSON.stringify(defaults));
            this.goals[this.goals.length] = JSON.stringify(this.current);
            this.i = this.goals.length-1;
        },
        deleter:function () {
            canDel=true;
        },
        setActive:function (key) {
            // Было нажато удаление
            if(canDel){
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