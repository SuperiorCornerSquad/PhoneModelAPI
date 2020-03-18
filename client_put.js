/**
 * Renames a table in the database (oldName -> newName)
 */
function updateManufacturer(){
    let oldName = document.getElementById("getMfrCall").value;
    let newName = document.getElementById( "trueMfr").value;
    //make sure the fields are unequal to avoid unnecessary traffic
    if(oldName !== newName) {
        let jsonBody = "{\"manufacturer\":\"" + newName + "\"}";
        console.log(jsonBody);
        let xhrPut = new XMLHttpRequest();
        xhrPut.onreadystatechange = function () {
            if (xhrPut.readyState == 4 && xhrPut.status == 200) {
                console.log(xhrPut.responseText);
            }
        };

        xhrPut.open("PUT", `/api/v1/manufacturers/${oldName}` ,true);
        xhrPut.setRequestHeader("Content-type", "application/json");
        xhrPut.send(jsonBody);
    }else{
        console.log("Manufacturer names must not be equal")
    }
}

/**
 * Sends the altered values of a phone in json-format to the database
 */
function updateProduct() {
    let manufacturer = document.getElementById("mfr").value;
    let phoneID = document.getElementById( "model_id").value;
    let dataFieldIDs =["model_id", "model_name", "release_date", "weight_g", "display_size_inch",
        "resolution", "camera", "battery_capacity", "operating_system", "os_version", "category"];
    let jsonBody ="{\"";
    for(let i in dataFieldIDs){
        let fieldValue = document.getElementById(dataFieldIDs[i]).value;
        if(fieldValue.length > 0) {
            jsonBody += dataFieldIDs[i] + "\":\"" + fieldValue + "\",\"";
        }
    }
    jsonBody = jsonBody.substring(0, jsonBody.length -2)
    jsonBody += "}";

    let xhrPut = new XMLHttpRequest();
    xhrPut.onreadystatechange = function () {
        if (xhrPut.readyState == 4 && xhrPut.status == 200) {
            console.log(xhrPut.responseText);
        }
    };

    xhrPut.open("PUT", `/api/v1/manufacturers/${manufacturer}/${phoneID}` ,true);
    xhrPut.setRequestHeader("Content-type", "application/json");
    xhrPut.send(jsonBody);
}