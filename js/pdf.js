function genPDF() {
    var doc = new jsPDF();
    doc.fromHTML($("#modal .modal-body").html(),20,20,{'width':500});
    doc.save('YourPlans.pdf');
}