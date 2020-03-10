function sendJson() {
    let newManufacturer;
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            json = JSON.parse(xmlhttp.responseText);
        }
    }

    xmlhttp.open("POST", "http://localhost:8081/api/v1/manufacturers?manufacturer=" + newManufacturer ,true)
    xmlhttp.send();
}