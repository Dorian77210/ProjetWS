window.addEventListener("DOMContentLoaded", loadFilm);

async function loadFilm() {
    // do the await things here.
    const $wikiID = "18851588";
    const $imageContainer = document.getElementById("image-container");

    const byWikiID = new QueryBuilder();

    // films matchant avec le texte
    byWikiID.addPrefix("dbr", "<http://dbpedia.org/resource/>")
    .addPrefix("dbo", "<http://dbpedia.org/ontology/>")
    .addPrefix("dbp", "<http://dbpedia.org/property/>")
    .selectDistinct("name","abstract", "country", "runtime", "language", "directorName", "starring")
    .where("?film a dbo:Film;")
    .andWhere("dbp:name ?name;")
    .andWhere("dbo:abstract ?abstract;")
    .andWhere("dbp:country ?country;")
    .andWhere("dbp:runtime ?runtime;")
    .andWhere("dbp:language ?language;")
    .andWhere("dbp:director ?director;")
    .addWhere("dbo:starring ?starring ;")
    //.addWhere("dbp:producer ?producer;")
    //.addWhere("dbp:music ?music;")
    //.addWhere("dbp:distributor ?distributor;")
    .andWhere("dbo:wikiPageID "+$wikiID)
    .optional("?country rdfs:label ?countryLabel. FILTER(langMatches(lang(?countryLabel),'en')) ")
    .optional("?starring rdfs:label ?starringLabel."+
                "FILTER(langMatches(lang(?starringLabel),'en'))")
    .filter(`langMatches(lang(?abstract), "en")`);

    console.log(byWikiID.__toString());
    var filmData = null;
    try {
        var result = await byWikiID.request();
        filmData = result.data.results.bindings;
        console.log(filmData);
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


    // Ajout des informations du film
    console.log("Abstract",filmData[0].abstract.value)

    document.getElementById("name").innerHTML = filmData[0].name.value;

    var country = document.getElementById('country');
    var text = document.createTextNode(filmData[0].country.value);
    country.appendChild(text);

    var runtime = document.getElementById('runtime');
    var text1 = document.createTextNode(filmData[0].runtime.value);
    runtime.appendChild(text1);

    var language = document.getElementById('language');
    var text1 = document.createTextNode(filmData[0].language.value);
    language.appendChild(text1);

    var director = document.getElementById('director');
    var text2 = document.createTextNode(filmData[0].director.value);
    director.appendChild(text2);

    var abstract = document.getElementById('abstract');
    var text2 = document.createTextNode(filmData[0].abstract.value);
    abstract.appendChild(text2);

    
    //document.getElementById("country").innerHTML = countryName;
    //document.getElementById("runtime").innerHTML = filmData[0].name.value;
    //document.getElementById("language").innerHTML = countryName;
    //document.getElementById("director").innerHTML = filmData[0].abstract.value;
    //document.getElementById("abstract").innerHTML = filmData[0].abstract.value;
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