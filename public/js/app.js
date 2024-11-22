class DestinationClass { //Classe qui contient toutes les destinations
    constructor(dest) {
        this._pays = dest["Pays"]
        this._prix = dest["Prix"]
        this._pDej = dest["Pdej"]
        this._animaux = dest["animaux"]
        this._ville = dest["Ville"]
        this._image = dest["images"]
        this._description = dest["description"]
        this._maps = dest["maps"]
    }
}

function templateindex() { //Fonction qui permet d'Afficher toutes les destinations à partir d'un fichier json
    window.onscroll = function() { 
        var header = document.querySelector('header');
        // Ajoute ou supprime la classe 'solid-header' en fonction de la position de défilement
        if (window.pageYOffset > 950) {
            header.classList.add('solid-header');
        } else {
            header.classList.remove('solid-header');
        }
    };
    fetch('../js/destination.json')
        .then(response => response.json())
        .then(destinationjson => {
            jsonpourfiltre = destinationjson
            const photoDestination = document.getElementById("PhotoDestination");
            var tableDestination = []
            for (let dest of destinationjson["destination"]) {
                tableDestination.push(new DestinationClass(dest));
            }
            const template = document.getElementById("TemplatePhotoDestination"); //Reference de notre template que l'on va modifier
            const fetchPromises = [];
            for (let d of tableDestination) {
                const fetchPromise = fetch('https://api.openweathermap.org/data/2.5/weather?q=' + d._ville + '&units=metric&appid=' + clefAPI)
                    //On importe la température
                    .then(response => response.json())
                    .then(json => {
                        const temperature = Math.round(json.main.temp);
                        let clone = document.importNode(template.content, true);
                        let newContent = clone.firstElementChild.innerHTML //On remplace dans notre template
                            .replace(/{{Pays}}/g, d._pays)
                            .replace(/{{Prix}}/g, d._prix)
                            .replace(/{{Ville}}/g, d._ville)
                            .replace(/{{Température}}/g, temperature);
                        clone.firstElementChild.innerHTML = newContent;
                        document.getElementById("PhotoDestination").appendChild(clone);
                    });
                fetchPromises.push(fetchPromise);
            }
            // Attendre que toutes les requêtes fetch soient terminées avant de poursuivre
            Promise.all(fetchPromises).then(() => { recupererValeursFiltre() })
        });
}

function destinationEtSurvolement() {
    headerBas()
    fetch('../js/destination.json') //On récupère le fichier Json
        .then(response => response.json())
        .then(destinationjson => {
            var tableDestination = []
            for (let dest of destinationjson["destination"]) {
                tableDestination.push(new DestinationClass(dest)); //On crée un tableau contenant toutes les classes
            }
            var u = new URLSearchParams(window.location.search);
            var dest = u.get("dest")
            for (d of tableDestination) {
                if (d._pays == dest) {
                    calculPrix(d)
                    ajouteAvis(d)
                    afficheAvis(d)
                    document.getElementById("GrandePhoto").src = d._image + "1.webp"
                    document.getElementById("Photo1").style.transform = "scale(1.1)"
                    for (let i = 1; i < 7; i++) {
                        document.getElementById("Photo" + i).src = d._image + i + ".webp"; //On place toutes les petites images sur le côté
                        //Gestion du survolement
                        document.getElementById("Photo" + i).addEventListener("mouseover", function () {
                            //Quand on passe notre souris sur la petite image => la petite image grossit un peu et la grande photo prend le visuel de la petite photo
                            document.getElementById("GrandePhoto").src = d._image + i + ".webp";
                            document.getElementById("Photo" + i).style.transform = "scale(1.1)"
                            document.getElementById("Photo" + i).style.transition = ".3s ease-in-out"
                            for (let j = 1; j < 8; j++) {
                                if (j != i) {
                                    if (document.getElementById("Photo" + j) !== null) {
                                        document.getElementById("Photo" + j).style.transform = "scale(1)"
                                        document.getElementById("Photo" + j).style.transition = ".3s ease-in-out"
                                    }
                                }
                            }
                        }, false);
                    }
                    document.getElementById("titredescription").textContent = d._ville //On place les autres éléments
                    document.getElementById("textedescription").textContent = d._description
                    document.getElementById("cartedescription").src = d._maps
                    break
                }
            }
        })
}

function recupererValeursFiltre() { //Gestion du filtre
    //On importe les différentes valeurs du filtre
    var valeurPrixMin = document.getElementById("prixMin").value;
    var valeurPrixMax = document.getElementById("prixMax").value;
    var animauxAcceptes = document.getElementById("animaux").checked;
    var petitDejeunerCompris = document.getElementById("Pdej").checked;
    var tableDestination = [] //Dans tableDestination, il y aura les destinations qui correspondes aux critères rentrés
    for (let dest of jsonpourfiltre["destination"]) { //Toutes 
        if (dest.Prix > valeurPrixMin) {
            if (dest.Prix < valeurPrixMax) {
                if (animauxAcceptes == true) {
                    if (dest.animaux == true) {
                        if (petitDejeunerCompris == true) {
                            if (dest.Pdej == true) {
                                tableDestination.push(new DestinationClass(dest));
                            }
                        } else {
                            tableDestination.push(new DestinationClass(dest));
                        }
                    }
                } else {
                    if (petitDejeunerCompris == true) {
                        if (dest.Pdej == true) {
                            tableDestination.push(new DestinationClass(dest));
                        }
                    } else {
                        tableDestination.push(new DestinationClass(dest));
                    }
                }
            }
        }
    }
    var tableDestinationVille = []
    for (let dest of tableDestination) {
        tableDestinationVille.push(dest._ville)
    }
    for (let dest of jsonpourfiltre["destination"]) {
        if (tableDestinationVille.includes(dest.Ville)) { //Si jamais la destination n'est pas présente dans le tableau où il y a les destinations correspondantes aux filtres => On enleve destination
            d = document.getElementById('filtre' + dest.Ville)
            d.parentNode.style.display = 'block'
        } else {
            d = document.getElementById('filtre' + dest.Ville)
            d.parentNode.style.display = 'none'
        }
    }
    if (tableDestinationVille.length === 0) { //Permet de gérer s'il ny a aucune destination qui correspond aux filtres
        document.getElementById('PasDestination').innerText = "Nous n'avons rien à vous proposez"
    } else {
        document.getElementById('PasDestination').innerText = ""
    }
}

function headerBas() { //Fonction qui permet de gérer le header
    window.onscroll = function () {
        var header = document.querySelector('header');
        if (window.pageYOffset > 10) {
            header.classList.add('solid-header');
        } else {
            header.classList.remove('solid-header');
        }
    }
}

function calculPrix(destination) {
    //On récupère toutes les informations initiale du formulaire de réservation
    var dateActuelle = new Date()
    var dateFormatee = convertionEnaaaammdd(dateActuelle) //Convertion en un bon format 
    document.getElementById('DateDebut').min = dateFormatee
    document.getElementById('DateFin').min = dateFormatee
    var animauxChecked = destination._animaux
    var pdejChecked = destination._pDej
    var prix = destination._prix
    if (!animauxChecked) {
        document.getElementById('AnimauxTxt').innerText = "Les animaux ne sont pas acceptés"
        document.getElementById('Animaux').style.display = "none"
    }
    if (!pdejChecked) {
        document.getElementById('PetitDejTxt').innerText = "Les petits déjeuners ne sont pas disponibles"
        document.getElementById('PetitDej').style.display = "none"
    }
    const form = document.getElementById('form')
    form.addEventListener('change', function (event) { //Dès que l'utilisateur change le formulaire de réservation
        event.preventDefault() //Empeche la page de recharger
        dateDebut = document.getElementById('DateDebut').valueAsNumber
        if (dateDebut != "") {
            let dateMin = convertionEnaaaammdd(new Date(dateDebut + 1000 * 3600 * 24))
            document.getElementById('DateFin').min = dateMin
        }
        dateFin = document.getElementById('DateFin').valueAsNumber
        if (dateFin != "") {
            let dateMax = convertionEnaaaammdd(new Date(dateFin - 1000 * 3600 * 24))
            document.getElementById('DateDebut').max = dateMax
        }
        var jour = (dateFin - dateDebut) / 1000 / 3600 / 24
        nbrAdulte = document.getElementById('NbrAdulte').value
        nbrEnfant = document.getElementById('NbrEnfant').value
        petitDej = document.getElementById('PetitDej').checked

        if (nbrAdulte === '2' && nbrEnfant === '0' && destination._ville === 'Paris') {
            prixTotal = jour * nbrAdulte * prix * 0.7
        } else {
            prixTotal = Math.abs(jour * (nbrAdulte * prix + nbrEnfant * prix * 0.4)) //Permet de calculer le prix du voyage
        }
        if (petitDej === true) {
            prixTotal = prixTotal + 15 * jour * (parseInt(nbrAdulte) + parseInt(nbrEnfant))
        }
        if (Number.isNaN(prixTotal) || nbrAdulte == 0) { //Donne la possibilité d'ajouter au panier et d'afficher le prix
            document.getElementById('ajouterAuPanier').disabled = true
            document.getElementById('Prix').innerText = "Prix du voyage : "
        } else {
            document.getElementById('ajouterAuPanier').disabled = false
            document.getElementById('Prix').innerText = "Prix du voyage : " + prixTotal + " €"
        }
    })
    form.addEventListener('reset', function (event) { //Pour le bouton 
        event.preventDefault() 
        document.getElementById('DateDebut').value = ""
        document.getElementById('DateFin').value = ""
        document.getElementById('NbrAdulte').value = "0"
        document.getElementById('NbrEnfant').value = "0"
        document.getElementById('PetitDej').checked = false
        document.getElementById('Animaux').checked = false
        document.getElementById('Prix').innerText = "Prix du voyage : "
    })
    form.addEventListener('submit', function (event) { //Quand l'utilisateur clique sur ajouté au panier
        event.preventDefault()
        destinationToPanier(destination)
        new swal({
            text: "Votre voyage pour " + destination._ville + " a bien été ajouté au panier",
            icon: "success",
            showConfirmButton: false,
            timer: 3000
        }).then(response => window.location.href = "../index.html")
    })
}

function convertionEnaaaammdd(date) { //Permet de convertir date au bon format
    // On obtient le jour, le mois et l'année
    var jour = date.getDate();
    var mois = date.getMonth() + 1;
    var annee = date.getFullYear();
    if (jour < 10) {
        jour = '0' + jour;
    }
    if (mois < 10) {
        mois = '0' + mois;
    }
    let dateFormatee = annee + '-' + mois + '-' + jour;
    return dateFormatee
}

function destinationToPanier(destination) { //Cette fonction ajoute dans le sessionstorage un élément (notre sessionstorage correspond ici au panier)
    var animaux = document.getElementById("Animaux").checked
    if (sessionStorage.getItem('0') == null) {
        sessionStorage.setItem('index', '0')
        sessionStorage.setItem('0', JSON.stringify([destination, dateDebut, dateFin, nbrAdulte, nbrEnfant, petitDej, animaux, prixTotal]))
    } else {
        var index = parseInt(sessionStorage.getItem('index')) + 1
        sessionStorage.setItem('index', index)
        sessionStorage.setItem(index, JSON.stringify([destination, dateDebut, dateFin, nbrAdulte, nbrEnfant, petitDej, animaux, prixTotal]))
    }
}

function panier() { //Fonction qui permet d'afficher le contenu du panier
    headerBas()
    const template = document.getElementById("TemplatePanier");
    if (sessionStorage.getItem('index') !== null) {
        var prixtotal = 0
        for (let i = 0; i <= sessionStorage.getItem('index'); i++) {
            var recuperation = JSON.parse(sessionStorage.getItem(i)) //On recupere la valeur du session storage 
            var pdejPanier = ""
            var animauxPanier = ""
            if (recuperation[5]) { //Verifie s'il y a un petit dej ou des animaux
                pdejPanier = "Petit déjeuner compris"
            }
            if (recuperation[6]) {
                animauxPanier = "Animaux compris"
            }
            prixtotal += recuperation[7]
            let clone = document.importNode(template.content, true); //Template pour le modifier et ajouter tous éléments présent dans le panier
            let newContent = clone.firstElementChild.innerHTML
                .replace(/{{Pays}}/g, recuperation[0]._pays)
                .replace(/{{Prix}}/g, recuperation[7])
                .replace(/{{Ville}}/g, recuperation[0]._ville)
                .replace(/{{DateDebut}}/g, new Date(recuperation[1]).toLocaleDateString())
                .replace(/{{DateFin}}/g, new Date(recuperation[2]).toLocaleDateString())
                .replace(/{{NbrAdulte}}/g, recuperation[3])
                .replace(/{{NbrEnfant}}/g, recuperation[4])
                .replace(/{{Pdej}}/g, pdejPanier)
                .replace(/{{Animaux}}/g, animauxPanier);
            clone.firstElementChild.innerHTML = newContent;
            document.getElementById("PanierDiv").appendChild(clone);
            textePrixTotal = document.getElementById("PrixTotal").innerText = "Prix total : " + prixtotal + ' €'
        }
    } else { //Gere si le panier est vide
        document.getElementById("PasPanier").innerText = "Le panier est vide"
        document.getElementById("FinPanier").innerHTML = ""
        document.getElementById('PanierDiv').style.marginBottom = "487px"
    }
}

function videPanier() { //Permet de vider le panier
    sessionStorage.clear()
}

function confirmation() { //Permet de gérer la page pour confirmer son achat
    headerBas()
    var prixtotal = 0
    const template = document.getElementById("TemplateDestinationRappel");
    for (let i = 0; i <= sessionStorage.getItem('index'); i++) {
        let recuperation = JSON.parse(sessionStorage.getItem(i))
        prixtotal += recuperation[7]
        let clone = document.importNode(template.content, true); //Template pour l'affichage de la commande
        let newContent = clone.firstElementChild.innerHTML
            .replace(/{{Pays}}/g, recuperation[0]._pays)
            .replace(/{{Prix}}/g, recuperation[7])
            .replace(/{{Ville}}/g, recuperation[0]._ville);
        clone.firstElementChild.innerHTML = newContent;
        document.getElementById("DivDestRappel").appendChild(clone);
    }
    var formConfirm = document.getElementById('facturation')
    formConfirm.addEventListener('submit', function (event) { //Affiche pop up la commande a bien été confirmé
        event.preventDefault()
        let prenom = document.getElementById('prenom').value
        new swal({
            title: 'Merci ' + prenom + ' pour votre achat',
            text: 'Vous recevrez bientôt un mail de confirmation de commande.',
            icon: "success",
            showConfirmButton: false,
        }).then((result) => window.location.href = "../index.html")
        videPanier()
    })
}

$(function composant() { // chargement du footer et header c'est à dire les composants (jQuery)
    $("header").load("../composants/header.html");
    $("footer").load("../composants/footer.html");
});



function afficheAvis(destination) { //Fonction qui permet d'afficher les avis présent (Le localstorage permet de gérer les avis)
    avis = false
    const template = document.getElementById("templateAvis");
    if (localStorage.getItem('index') !== null) {
        for (var i = localStorage.getItem('index'); i >= 0; i--) {
            let recuperation = JSON.parse(localStorage.getItem(i))
            if (recuperation[0]._ville == destination._ville) { //Permet de vérifier que l'avis est bien pour cette destination
                avis = true
                let clone = document.importNode(template.content, true); //Permet de gérer template pour afficher Avis
                let newContent = clone.firstElementChild.innerHTML
                    .replace(/{{Pseudo}}/g, recuperation[1])
                    .replace(/{{Texte}}/g, recuperation[2]);
                clone.firstElementChild.innerHTML = newContent;
                document.getElementById("AvisPresent").appendChild(clone);
            }
        }
        if (!avis) { //Permet de gérer s'il n'y a pas d'avis
            document.getElementById('PasAvis').innerText = "Pas d'Avis"
        }
    } else {
        document.getElementById('PasAvis').innerText = "Pas d'Avis"
    }
}

function ajouteAvis(destination) { //Fonction qui permet d'ajouter un avis
    formAvis = document.getElementById('AjoutAvis')
    formAvis.addEventListener('submit', function (event) {
        event.preventDefault()
        var pseudo = document.getElementById('PseudoAvis').value
        var texte = document.getElementById('TextAvis').value
        if (localStorage.getItem('0') == null) {
            localStorage.setItem('index', '0')
            localStorage.setItem('0', JSON.stringify([destination, pseudo, texte])) //Ajoute l'avis dans le localstorage
        } else {
            var index = parseInt(localStorage.getItem('index')) + 1
            localStorage.setItem('index', index)
            localStorage.setItem(index, JSON.stringify([destination, pseudo, texte]))
        }
        document.getElementById('PseudoAvis').value = ""
        document.getElementById('TextAvis').value = ""
        const template = document.getElementById("templateAvis");
        let clone = document.importNode(template.content, true); //Ajoute l'avis dès qu'on appuie sur ajouter un avis
        let newContent = clone.firstElementChild.innerHTML
            .replace(/{{Pseudo}}/g, pseudo)
            .replace(/{{Texte}}/g, texte);
        clone.firstElementChild.innerHTML = newContent;
        document.getElementById("AvisPresent").insertBefore(clone, document.getElementById("AvisPresent").firstChild);
        document.getElementById('PasAvis').innerText = ""
    })
}

function aPropos() { //Gère la page A Propos et Contact
    headerBas()
}

function envoyerEmail() {
    emailjs.init("wZEsSR08aWE2O5Jre");
    var email = document.getElementById("email").value; // Récupére les valeurs du form
    var message = document.getElementById("message").value;
    emailjs.send("default_service", "template_wrx1ueo", { // Envoie de l'e-mail en utilisant email.js
        to_name : "FierVol",
        from_name: email,
        message : message
    })
    .then(reponse => {
        document.getElementById("email").value = ""
        document.getElementById("message").value = ""
        new swal({
            title:"Votre message a bien été envoyé",
            text: "Nous vous recontacterons dans les plus brefs délais",
            icon: "success",
            showConfirmButton:false
        })
    })
}

function creaAvis() { //Fonction qui permet d'ajouter directement plein d'avis (A Appeler dans la console)
    fetch('../js/destination.json')
        .then(response => response.json())
        .then(destinationjson => {
            var tableDestination = []
            for (let dest of destinationjson["destination"]) {
                tableDestination.push(new DestinationClass(dest));
            }
            if (localStorage.getItem('0') == null) {
                localStorage.setItem('index', '0')
                localStorage.setItem('0', JSON.stringify([tableDestination[0], "Raphael", "La légende raconte que si un couple prend un voyage pour Paris, il a une réduction"]))
            }
            Pseudo = ["DarkSasukeDu69", "Noah", "Mario", "Donald", "Naruto Otaku"]
            Texte = ["Paris = Ville de l'amour", "La bière allemande &#9825;", "PIZZAAAAAA", "AMERICA !!!", "Le magasin Nintendo est incroyable ! Je recommande"]
            for (let i = 0; i < 5; i++) { //Permet d'ajouter plusieurs avis
                var index = parseInt(localStorage.getItem('index')) + 1
                localStorage.setItem('index', index)
                localStorage.setItem(index, JSON.stringify([tableDestination[i], Pseudo[i], Texte[i]]))
            }
        })
}
function supprAvis() { //Fonction qui permet de supprimer tous les avis
    localStorage.clear()
}