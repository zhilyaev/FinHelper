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
            console.log("Error index in localStorage");
        }
    }

    return res;
};
/* Remove like ListArray */
Object.getPrototypeOf(localStorage).safeRemove = function (index) {
    // Вспомним Алгоритмы

};
// Первый раз запустили приложуху
if(localStorage.length===0) localStorage[0] = JSON.stringify(defaults);
var canDel = false;
var app = new Vue({
    el:"#app",
    data:{
        current:JSON.parse(localStorage[0]),
        goals: localStorage
    },
    computed:{
        resultPercent:function () {
            return 0;
        }
    },
    watch: {
        current:{
            handler:function (newVal) {
                this.goals[this.current.prior-1]=JSON.stringify(this.current);
                console.log("save=>"+JSON.stringify(this.current));
            },
            deep:true
        }
    },
    methods: {
        creator: function () {
            this.current = JSON.parse(JSON.stringify(defaults));
            this.current.prior=this.goals.length+1;
            this.goals[this.goals.length] = JSON.stringify(this.current);
        },
        deleter:function () {
            if(this.goals.length===1){
                alert("Нельзя удалить все цели");
            }else canDel=true;
        },
        setActive:function (key) {
            /* Костыльный велоспиед отлова вложенного события */
            if(canDel){
                canDel = false;
                // Переключатся на ближайший слева
                this.current = JSON.parse(this.goals[key-2]);
                // Удалить последний элемент очень просто!
                if(key===this.goals.length){
                    //console.log("Простое удаление");
                    delete this.goals[key-1];
                }
                // Удаление со сдвигом // todo @Vonvee
                else {
                    var i=key-1;
                    for(i;i<this.goals.length;i++){
                        delete this.goals[i];
                        // get next
                        var next = JSON.parse(this.goals[i+1]);
                        next.prior = i+1;
                        //console.log("Сложное удаление ["+i+"] "+JSON.stringify(next));
                        this.goals[i] = JSON.stringify(next);
                    }
                    delete this.goals[1];
                }
            }
            else this.current = JSON.parse(this.goals[key-1]);
        }
    }
});