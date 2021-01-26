window.addEventListener("DOMContentLoaded", loadFilm);

async function loadFilm() {
    // do the await things here.
    const $wikiID = "18851588";//"18851588";
    const wikiIDavatar = "4273140";
    const $imageContainer = document.getElementById("image-container");

    const byWikiID = new QueryBuilder();

    // films matchant avec le texte
    byWikiID.addPrefix("dbr", "<http://dbpedia.org/resource/>")
    .addPrefix("dbo", "<http://dbpedia.org/ontology/>")
    .addPrefix("dbp", "<http://dbpedia.org/property/>")
    .selectDistinct("name", "distributor", "starringName", "music", "abstract", "countryName", "runtime", "producerLabel", "directorLabel")
    .where("?film a dbo:Film;")
    .andWhere("dbp:name ?name;")
    .andWhere("dbo:abstract ?abstract;")
    .andWhere("dbp:country ?country;")
    .andWhere("dbp:runtime ?runtime;")
    //.andWhere("dbp:language ?language;")
    .andWhere("dbp:director ?director;")
    .andWhere("dbo:starring ?starring;")
    .andWhere("dbo:producer ?producer;")
    .andWhere("dbp:music ?music;")
    .andWhere("dbp:distributor ?distributor;")
    .andWhere("dbo:wikiPageID "+$wikiID)
    .optional("?country rdfs:label ?countryLabel. FILTER(langMatches(lang(?countryLabel),'en'))", 
                "?starring rdfs:label ?starringLabel. FILTER(langMatches(lang(?starringLabel),'en'))",
                "?producer rdfs:label ?producerLabel. FILTER(langMatches(lang(?producerLabel),'en'))",
                "?director rdfs:label ?directorLabel. FILTER(langMatches(lang(?directorLabel),'en'))")
    .bind({condition : "?starring rdfs:label ?starringLabel.", caseTrue : "?starringLabel", caseFalse: '""', newName: "?starringName"}, 
            {condition : "?country rdfs:label ?countryLabel.", caseTrue : "?countryLabel", caseFalse: '""', newName: "?countryName"})
    .filter(`langMatches(lang(?abstract), "en")`);

    console.log(byWikiID.__toString());
    var filmData = null;
    try {
        var result = await byWikiID.request();
        filmData = await result.data.results.bindings;
        console.log(filmData);
        let starringName = "";
        filmData.map((film)=>{
            starringName += film.starringName.value+", ";
        })
        // Set des données
        document.getElementById("name").innerHTML = filmData[0].name.value;

        document.getElementById("country").innerHTML = filmData[0].countryName.value;

        document.getElementById("runtime").innerHTML = convertSecToHour(parseFloat(filmData[0].runtime.value));

        document.getElementById("director").innerHTML = filmData[0].directorLabel.value;

        document.getElementById("producer").innerHTML = filmData[0].producerLabel.value;

        document.getElementById("starring").innerHTML = starringName;

        document.getElementById("distributor").innerHTML = filmData[0].distributor.value;

        document.getElementById("music").innerHTML = filmData[0].music.value;

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
    
    //document.getElementById("country").innerHTML = countryName;
    //document.getElementById("runtime").innerHTML = filmData[0].name.value;
    //document.getElementById("language").innerHTML = countryName;
    //document.getElementById("director").innerHTML = filmData[0].abstract.value;
    //document.getElementById("abstract").innerHTML = filmData[0].abstract.value;
}


function convertSecToHour(timeSec){
    const hour = Math.floor(timeSec / 3600);
    const min = Math.floor((timeSec % 3600) / 60);
    return hour+':'+min;
}


/*function request()
        {       

            Informations du film :
                - Titre/name (Original et autres)
                - Catégorie
                - Synopsis
                - Acteurs
                - Réalisateur
                - Producteur
                - Pays
                - année de sortie
                - Durée
                - VO
                - Auteur/Scénariste
                - Montage
                - Musique
                - Photographie
                - Société de production

            var query = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf−schema#>"+
                        "PREFIX dbo: <http://dbpedia.org/ontology/>"+
                        "PREFIX dbp: <http://dbpedia.org/property/>"+

                        "SELECT DISTINCT * WHERE {"+
                        "?movie a dbo:Film ."+
                        "?movie dbp:name ?name ."+
                        "?movie dbo:abstract ?abstract ."+
                        "?movie dbp:country ?country ."+
                        //"?country dbp:label ?label ."+
                        "?movie dbp:runtime ?runtime ."+
                        "?movie dbp:language ?language ."+
                        "?movie dbp:director ?director ."+
                        "?movie dbp:producer ?producer ."+
                        "?movie dbp:music ?music ."+
                        "?movie dbp:distributor ?distributor ."+
                        //"?movie dbp:image ?photo ."
                        //"?movie dbp:language ?language ."+
                        //"?movie dbp:language ?language ."+
                        //"?movie dbp:language ?language ."+


                        "filter regex(lcase(str(?name)) ,lcase('.*Titanic.*'))"+
                        "filter langMatches(lang(?abstract), 'fr')"+
                        "}";

            var url = "http://dbpedia.org/sparql";
            url =  url+"?query="+ encodeURIComponent(query) +"&format=json";

            console.log(query);

            return axios.get(url)
                .then(res => {
                    //console.log("résultat", res);
                    var data = res.data.results.bindings;
                    var countryParts = data[0].country.value.split('/');
                    var countryName = countryParts[countryParts.length - 1];
                    console.log("data", data[0], "\n\n", countryName)
                    document.getElementById("name").innerHTML = data[0].name.value;
                    document.getElementById("country").innerHTML = countryName;
                    document.getElementById("abstract").innerHTML = data[0].abstract.value;
                }).catch(err => console.log(err));
            ;
        }

        request();*/