function updateManufacturer(){

}
function updateProduce() {
    let manufacturer = document.getElementById("mfr").value;
    let phoneID = document.getElementById( "model_id").value;

    let modelDataJson = {
        "model_id": document.getElementById( "model_id").value,
        "model_name": document.getElementById("model_name").value,
        "release_date": document.getElementById("release_date").value,
        "weight_g": document.getElementById("weight_g").value,
        "display_size_inch": document.getElementById("display_size_inch").value,
        "resolution": document.getElementById("resolution").value,
        "camera": document.getElementById("camera").value,
        "battery_capacity": document.getElementById("battery_capacity").value,
        "operating_system": document.getElementById("operating_system").value,
        "os_version": document.getElementById("os_version").value,
        "category": document.getElementById("category").value
    };


    let xhrPut = new XMLHttpRequest();
    xhrPut.onreadystatechange = function () {
        if (xhrPut.readyState == 4 && xhrPut.status == 200) {
            console.log(xhrPut.responseText);
        }
    }

    xhrPut.open("PUT", "http://localhost:8081/api/v1/manufacturers/" + manufacturer + "/" + phoneID ,true)
    xhrPut.setRequestHeader("Content-type", "application/json")
    xhrPut.send(JSON.stringify(modelDataJson));
}