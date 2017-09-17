function frodor() {
    var inCom = parseInt(document.getElementById("inCom").textContent);
    var aimTotalMoney = parseInt(document.getElementById("dream").value);
    // Если поле пустое то пусть будет ноль
    var totalToInvest = parseInt(document.getElementById("rightNow").value) || 0;
    // Разница месяцев
    var aimTime = Date.diff(new Date(), new Date(Date.parse(document.getElementById("date").value)))[1];
    var period = 12;
    var isPercentSimple = true;
    if (isPercentSimple) {
        var moneyWithoutPercents = totalToInvest + inCom * aimTime;
        var numberOfFullPeriods = aimTime / period;
        var profit = (aimTotalMoney - moneyWithoutPercents) / numberOfFullPeriods;
        var resultPercent = ((profit + moneyWithoutPercents) / moneyWithoutPercents - 1) * 100
    }
    //(Math.pow(aimTotalMoney / moneyWithoutPercents, 1 / numberOfPeriods)) - 1;
    if (0 < resultPercent < 50) {
        calculateDoc(inCom, resultPercent)
    }
    if (resultPercent < 0) {
        resultPercent = "Цель выполнится накоплением без вкладов."
    }
    if (reservePerc > 50) {
        resultPercent = "Выполнение цели недостижимо в данные сроки."
    }
    document.getElementById("result").textContent = resultPercent
}
function calculateDoc(inCom, resultPercent) {
    var consumption = parseInt(document.getElementById("minus").value)
    //Percents for income divide
    var brokerPerc = parseInt(document.getElementById("rightNow").value)
    var pillowPerc = parseInt(document.getElementById("rightNow").value)
    var reservePerc = parseInt(document.getElementById("rightNow").value)
    //Can invest now
    var totalToInvest = parseInt(document.getElementById("rightNow").value) || 0;
    var brokerNow = parseInt(document.getElementById("rightNow").value)
    var pillowNow = parseInt(document.getElementById("rightNow").value)
    var reserveNow = parseInt(document.getElementById("rightNow").value)
    var pillowMax = consumption * 6;
    var reserveMax = consumption * (1.5);
    var dateArr = new Array(Date.now())
    var sumArr = new Array(totalToInvest)
    var brokerArr = new Array(brokerNow)
    var pillowArr = new Array(pillowNow)
    var reserveArr = new Array(reserveNow)
    var currentDate = Date.now()
    var i = 0
    while (currentDate < new Date(Date.parse(document.getElementById("date").value))) {
        currentDate.setMonth(currentDate.getMonth() + 1)
        dateArr.add(currentDate)
        sumArr.add(sumArr[i] + inCom)
        brokerArr.add(brokerArr[i] + inCom * brokerPerc)
        pillowArr.add(pillowArr[i] + inCom * pillowPerc)
        reserveArr.add(reserveArr[i] + inCom * reservePerc)
        i++
    }
}