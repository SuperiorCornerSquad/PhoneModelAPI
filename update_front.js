function getCall() {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            json = JSON.parse(xmlhttp.responseText);
            if (json.length > 0){ // something found
                alert('Call received');
            }
            else {
                alert('got nothing from response')
            }
            
        }
        else {
            alert('jokin kusi');
        }
    };
    
    xmlhttp.open("GET", "/api/v1/manufacturers/" + document.getElementById('getCall').value ,true);
    xmlhttp.send();
}