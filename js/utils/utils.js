const DBPEDIA_URL = "http://dbpedia.org/sparql";

class QueryBuilder
{
    constructor()
    {
        this.prefix = "";
        this.whereBody = "";
        this.selectBody = "";
        this.filterBody = "";
        this.orderByBody = "";
    }

    /**
     * Permet de sélectionner des attributs dans un requête. 
     * Exemple : queryBuilder.select("nom", "prenom")
     * @param {Array} params Les paramètres à sélectionner 
     * @return L'objet courant
     */
    select(...params)
    {
        for (const param of params)
        {
            this.selectBody += (param !== "*")
                ? `?${param} `
                : "*";

        }

        return this;
    }

    /**
     * Permet de sélectionner des attributs dans un requête avec une contrainte DISTINCT. 
     * Exemple : queryBuilder.select("nom", "prenom")
     * @param {Array} params Les paramètres à sélectionner 
     * @return L'objet courant
     */
    selectDistinct(...params)
    {
        this.selectBody = "DISTINCT ";
        return this.select(...params);
    }

    /**
     * Permet d'ajouter une condition Where
     * @param {String} content Le contenu de la clause WHERE
     * @return L'objet courant
     */
    where(content)
    {
        this.whereBody = content;
        return this;
    }

    /**
     * Rajoute une condition dans la clause WHERE
     * @param {String} content Le contenu à ajouter
     * @return L'objet courant 
     */
    andWhere(content)
    {
        this.whereBody += " " + content;
        return this;
    }

    filter(f)
    {
        this.filterBody += "FILTER " + f + "\n";
        return this;
    }

    /**
     * Permet d'ajouter un préfixe dans la requête
     * @param {String} alias L'alias du préfixe 
     * @param {String} uri L'URI
     * @return L'objet courant 
     */
    addPrefix(alias, uri)
    {
        this.prefix += `PREFIX ${alias}: ${uri} \n`;
        return this;
    }
    
    orderBy(content)
    {
        this.orderByBody += `ORDER BY ${content}`;
        return this;
    }

    __toString()
    {
        var res = `${this.prefix} SELECT ${this.selectBody} WHERE { ${this.whereBody} ${this.filterBody} } ${this.orderByBody}`;
        
        return res;
    }

    request()
    {
        const query = this.__toString();
        const url = DBPEDIA_URL + "?query=" + encodeURIComponent(query) +"&format=json";
        return axios.get(url);
    }
};


/**
 * Permet de récupérer une image par l'id Wiki
 * @param {*} wikiID L'id Wiki
 */
const getImageURL = async wikiID => 
{
    var url = `https://en.wikipedia.org/w/api.php?origin=*&action=query&pageids=${wikiID}&prop=pageprops&format=json`;
    var result = await axios.get(url);
    if('pageprops' in result.data.query.pages[wikiID]){
        var pageImage = result.data.query.pages[wikiID].pageprops.page_image;
    }
    else {
        return "";
    }
    

    url = `https://en.wikipedia.org/w/api.php?origin=*&action=query&titles=Image:${pageImage}&prop=imageinfo&iiprop=url&format=json`;
    var result = await axios.get(url);
    const pages = result.data.query.pages;
    const key = Object.keys(pages)[0];

    const imageURL = (!pages[key].imageinfo)
                   ? ""
                   : pages[key].imageinfo[0].url;

                   
    return imageURL;
}