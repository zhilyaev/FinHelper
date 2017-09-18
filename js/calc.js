// Дефолтные настройки
const defaults ={
    prior:1,
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
            console.log(e);
        }
    }

    return res;
};
localStorage[0] = JSON.stringify(defaults);
var app = new Vue({
    el:"#app",
    data:{
        current:JSON.parse(localStorage[0]),
        goals: localStorage
    },
    computed:{
        resultPercent:function () {
            return 0;
        },
        isActive:function (index) {
            return index===this.current.prior;
        }
    },
    watch: {

    },
    methods: {
        creator: function () {
            this.current = JSON.parse(JSON.stringify(defaults));
            this.current.prior=this.goals.length+1;
            this.goals.setItem(this.goals.length,JSON.stringify(this.current));
        }
    }
});