window.addEventListener("DOMContentLoaded", loadFilm);

async function loadFilm() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // do the await things here.
    //const $wikiID = "18851588";
    const $wikiID = "4273140";
    const wikiIDavatar = "4273140";
    const $imageContainer = document.getElementById("image-container");

    const byWikiID = new QueryBuilder();

    // films matchant avec le texte
    byWikiID.addPrefix("dbr", "<http://dbpedia.org/resource/>")
    .addPrefix("dbo", "<http://dbpedia.org/ontology/>")
    .addPrefix("dbp", "<http://dbpedia.org/property/>")
    .selectDistinct("name", "distributor", "starringName", "musicName", "abstract", "countryName", "runtime", "producerLabel", "directorLabel")
    .where("?film a dbo:Film;")
    .andWhere("dbp:name ?name;")
    .andWhere("dbo:abstract ?abstract;")
    .andWhere("dbp:country ?country;")
    .andWhere("dbp:runtime ?runtime;")
    .andWhere("dbp:director ?director;")
    .andWhere("dbo:starring ?starring;")
    .andWhere("dbo:producer ?producer;")
    .andWhere("dbp:music ?music;")
    .andWhere("dbp:distributor ?distributor;")
    .andWhere("dbo:wikiPageID "+$wikiID)
    .optional("?country rdfs:label ?countryLabel. FILTER(langMatches(lang(?countryLabel),'en'))", 
                "?starring rdfs:label ?starringLabel. FILTER(langMatches(lang(?starringLabel),'en'))",
                "?producer rdfs:label ?producerLabel. FILTER(langMatches(lang(?producerLabel),'en'))",
                "?music rdfs:label ?musicLabel. FILTER(langMatches(lang(?musicLabel),'en'))",
                "?director rdfs:label ?directorLabel. FILTER(langMatches(lang(?directorLabel),'en'))")
    .bind({condition : "?starring rdfs:label ?starringLabel.", caseTrue : "?starringLabel", caseFalse: '""', newName: "?starringName"}, 
            {condition : "?country rdfs:label ?countryLabel.", caseTrue : "?countryLabel", caseFalse: "?country", newName: "?countryName"},
            {condition : "?music rdfs:label ?musicLabel.", caseTrue : "?musicLabel", caseFalse: "?music", newName: "?musicName"})
    .filter(`langMatches(lang(?abstract), "en")`);

    console.log(byWikiID.__toString());
    var filmData = null;
    try {
        var result = await byWikiID.request();
        filmData = await result.data.results.bindings;
        console.log(filmData);
        let starringName = "";
        filmData.map((film, index)=>{
            starringName += film.starringName.value;
            if(index !== filmData.length-1) {
                starringName += ", ";
            }
        })
        // Set des données
        document.getElementById("name").innerHTML = filmData[0].name.value;

        document.getElementById("country").innerHTML = filmData[0].countryName.value;

        document.getElementById("runtime").innerHTML = convertSecToHour(parseFloat(filmData[0].runtime.value));

        document.getElementById("director").innerHTML = filmData[0].directorLabel.value;

        document.getElementById("producer").innerHTML = filmData[0].producerLabel.value;

        document.getElementById("starring").innerHTML = starringName;

        document.getElementById("distributor").innerHTML = filmData[0].distributor.value;

        document.getElementById("music").innerHTML = filmData[0].musicName.value;

        document.getElementById("abstract").innerHTML = filmData[0].abstract.value;;
        
    } catch (err) {
        console.log(err)
    }

    const $img = document.createElement("img");
    var imageURL = await getImageURL($wikiID);
    if (imageURL === "")
    {
        imageURL = "./../img/no-poster-available.png";
    }

    $img.setAttribute("src", imageURL);
    $img.classList.add("film-img");
    $imageContainer.append($img);
}

function convertSecToHour(timeSec){
    const hour = Math.floor(timeSec / 3600);
    const min = Math.floor((timeSec % 3600) / 60);
    return hour+':'+min;
}