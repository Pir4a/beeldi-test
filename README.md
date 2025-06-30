# beeldi-test

- [x] L'application doit permettre de gérer un inventaire d'équipements.

Un équipement est défini par :

    - [x] Un identifiant unique
    - [x] Une précision sur le nom de l'équipement
    - [x] Un type d'équipement (ex: ascenseur électrique, chaudière gaz murale, etc.)
    - [x] Une marque (ex: Schindler, Thyssenkrupp, etc.)
    - [x] Un modèle
    - [x] Une date de création
    - [ ] Une date de modification

Un type d'équipement est défini par :

    - [x] Un identifiant unique
    - [x] Un nom
    - [x] Un parent (null pour les domaines)

- [ ] Un type d'équipement organisé en maximum 4 niveaux hiérarchiques.

Exemples de type d'équipement :

    - [x] LEVAGE ET MANUTENTION ( domaine )
        - [ ] Ascenseur ( type )
            - [ ] Ascenseur Électrique ( catégorie )
                - [ ] Ascenseur électrique à traction ( sous-catégorie )

    - [x] CHAUFFAGE ( domaine )
        - [ ] Chaudière ( type )
            - [ ] Chaudière gaz ( catégorie )
                - [ ] Chaudière gaz murale ( sous-catégorie )

    - [x] SÉCURITÉ ( domaine )
        - [ ] Détection incendie ( type )
            - [ ] Détecteur de fumée ( catégorie )
                - [ ] Détecteur optique de fumée ( sous-catégorie )
            - [ ] Centrale d'alarme ( catégorie )
                - [ ] Centrale d'alarme incendie conventionnelle ( sous-catégorie )

- [ ] Un CSV est fourni avec plusieurs exemples de types d'équipements.

# API - Fonctionnalités CRUD

## Mutations

    - [x] Créer un équipement : Validation des données
    - [ ] Modifier un équipement : Mise à jour partielle ou complète des champs
    - [ ] Supprimer un équipement : Suppression logique ou physique

## Interface utilisateur

    - [ ] Lister les équipements :
        - [ ] Tableau d'équipements avec les colonnes : nom, domaine, type, catégorie, sous-catégorie, marque, modèle
        - [ ] Filtrage par domaine, type, catégorie ou sous-catégorie
        - [ ] Recherche par marque/modèle
    - [ ] Formulaire de création/édition :
        - [ ] Sélection hiérarchique du type d'équipement (dropdowns en cascade)
        - [ ] Champs marque et modèle (texte libre)
        - [ ] Validation des données
    - [ ] Supprimer un équipement :
        - [ ] Confirmation de la suppression

## Consignes techniques

    - [x] Langage : TypeScript
    - [x] Base de données : PostgreSQL
    - [x] Framework Frontend: React
    - [ ] Architecture : Architecture monolithique simple avec base de données relationnelle
    - [ ] Framework Backend: Express
    - [ ] ORM: Drizzle
    - [ ] Containerisation: Docker 
    - [ ] Librairies: Tailwind pour l'instant
    - [ ] Style: Libre
    - [ ] Tests: Libre
    - [ ] Documentation: Libre
    - [ ] Conventions: Libre

- [ ] Lors du briefing, nous discuterons des choix techniques et des motivations de ces choix.

# Bonus

## Gestion de l'offline

    - [ ] Fonctionnement de l'interface en mode déconnecté
    - [ ] Synchronisation des données lors de la reconnexion

## Gestion de gros volumes (100 000+ équipements)

    - [ ] Performance Base de donnée et API
    - [ ] Performance Interface

## Enrichissement par IA

    - [ ] Détection du domaine, type, catégorie et sous-catégorie d'un équipement à partir des caractéristiques de l'équipement
