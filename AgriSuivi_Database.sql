-- ============================================================
-- AgriSuivi - Script DDL PostgreSQL complet
-- Pour importer dans PowerAMC : Database > Reverse Engineer
-- SGBD cible : PostgreSQL 14+
-- Architecture : Multi-tenant (django-tenants)
-- ============================================================

-- ============================================================
-- SCHEMA PUBLIC (SHARED) : Client, Domain, CustomUser
-- ============================================================

-- Table: Client (Tenant SaaS - chaque client = une exploitation)
CREATE TABLE public.client (
    id               BIGSERIAL       NOT NULL,
    schema_name      VARCHAR(63)     NOT NULL,
    name             VARCHAR(100)    NOT NULL,
    owner_name       VARCHAR(150)    NOT NULL,
    owner_email      VARCHAR(254)    NOT NULL,
    phone            VARCHAR(30)     NULL,
    region           VARCHAR(100)    NULL DEFAULT 'Centre',
    is_active        BOOLEAN         NOT NULL DEFAULT TRUE,
    created_on       DATE            NOT NULL,
    CONSTRAINT PK_CLIENT PRIMARY KEY (id),
    CONSTRAINT UQ_CLIENT_SCHEMA UNIQUE (schema_name)
);
COMMENT ON TABLE  public.client              IS 'Tenant SaaS - Exploitation agricole. Chaque enregistrement cree un schema PostgreSQL dedie.';
COMMENT ON COLUMN public.client.schema_name  IS 'Nom unique du schema PostgreSQL (ex: ferme_dupont)';
COMMENT ON COLUMN public.client.name         IS 'Nom commercial de l exploitation';
COMMENT ON COLUMN public.client.owner_email  IS 'Email du proprietaire (identifiant unique externe)';
COMMENT ON COLUMN public.client.region       IS 'Region du Cameroun';

-- Table: Domain (Domaine HTTP rattache au Tenant)
CREATE TABLE public.domain (
    id          BIGSERIAL       NOT NULL,
    domain      VARCHAR(253)    NOT NULL,
    is_primary  BOOLEAN         NOT NULL DEFAULT FALSE,
    tenant_id   BIGINT          NOT NULL,
    CONSTRAINT PK_DOMAIN PRIMARY KEY (id),
    CONSTRAINT UQ_DOMAIN UNIQUE (domain),
    CONSTRAINT FK_DOMAIN_CLIENT FOREIGN KEY (tenant_id)
        REFERENCES public.client (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
COMMENT ON TABLE  public.domain           IS 'Domaine HTTP rattache a un tenant (ex: ferme-dupont.localhost)';
COMMENT ON COLUMN public.domain.tenant_id IS 'FK vers Client (Tenant)';

-- Table: CustomUser (Utilisateur de la plateforme)
-- Herite de AbstractUser Django - stocke dans le schema public (SHARED_APP)
CREATE TABLE public.authentication_customuser (
    id                  BIGSERIAL       NOT NULL,
    username            VARCHAR(150)    NOT NULL,
    email               VARCHAR(254)    NULL,
    first_name          VARCHAR(150)    NULL,
    last_name           VARCHAR(150)    NULL,
    password            VARCHAR(128)    NOT NULL,
    role                VARCHAR(30)     NOT NULL DEFAULT 'EMPLOYE',
    phone               VARCHAR(30)     NULL,
    is_phone_verified   BOOLEAN         NOT NULL DEFAULT FALSE,
    avatar              VARCHAR(100)    NULL,
    is_active_employee  BOOLEAN         NOT NULL DEFAULT TRUE,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    is_staff            BOOLEAN         NOT NULL DEFAULT FALSE,
    is_superuser        BOOLEAN         NOT NULL DEFAULT FALSE,
    date_joined         TIMESTAMP       NOT NULL,
    last_login          TIMESTAMP       NULL,
    CONSTRAINT PK_CUSTOMUSER PRIMARY KEY (id),
    CONSTRAINT UQ_USERNAME UNIQUE (username),
    CONSTRAINT CHK_ROLE CHECK (role IN ('PROPRIETAIRE', 'EMPLOYE', 'COMPTABLE', 'ADMIN_PLATFORME'))
);
COMMENT ON TABLE  public.authentication_customuser              IS 'Utilisateur de la plateforme (herite AbstractUser Django). Schema public - SHARED.';
COMMENT ON COLUMN public.authentication_customuser.username     IS 'Identifiant unique (souvent = email)';
COMMENT ON COLUMN public.authentication_customuser.password     IS 'Hash du mot de passe (algorithme Django)';
COMMENT ON COLUMN public.authentication_customuser.role         IS 'PROPRIETAIRE | EMPLOYE | COMPTABLE | ADMIN_PLATFORME';


-- ============================================================
-- SCHEMA TENANT (par exploitation)
-- Les tables suivantes sont creees dans chaque schema tenant
-- ex: ferme_dupont.employes_employe
-- Pour PowerAMC : remplacer "{tenant}" par le nom du schema
-- ============================================================

-- Table: ParametresExploitation (Parametres et personnalisation)
CREATE TABLE exploitations_parametresexploitation (
    id                  BIGSERIAL       NOT NULL,
    nom                 VARCHAR(150)    NOT NULL,
    type_exploitation   VARCHAR(20)     NOT NULL DEFAULT 'CULTURES',
    logo                VARCHAR(100)    NULL,
    couleur_primaire    VARCHAR(7)      NOT NULL DEFAULT '#2e7d32',
    couleur_secondaire  VARCHAR(7)      NOT NULL DEFAULT '#81c784',
    adresse             TEXT            NULL,
    ville               VARCHAR(100)    NOT NULL DEFAULT 'Yaounde',
    devise              VARCHAR(10)     NOT NULL DEFAULT 'FCFA',
    superficie_totale   DECIMAL(10,2)   NOT NULL DEFAULT 0.0,
    description         TEXT            NULL,
    created_at          TIMESTAMP       NOT NULL,
    updated_at          TIMESTAMP       NOT NULL,
    CONSTRAINT PK_PARAMS PRIMARY KEY (id),
    CONSTRAINT CHK_TYPE_EXPLOITATION CHECK (type_exploitation IN ('CULTURES', 'ELEVAGE'))
);
COMMENT ON TABLE  exploitations_parametresexploitation                    IS 'Parametres et personnalisation de l exploitation - Schema tenant';
COMMENT ON COLUMN exploitations_parametresexploitation.type_exploitation  IS 'CULTURES | ELEVAGE';
COMMENT ON COLUMN exploitations_parametresexploitation.superficie_totale  IS 'Superficie totale en Hectares';
COMMENT ON COLUMN exploitations_parametresexploitation.devise             IS 'Devise utilisee ex: FCFA, EUR';

-- Table: Employe
CREATE TABLE employes_employe (
    id              BIGSERIAL       NOT NULL,
    user_id         BIGINT          NULL,
    nom             VARCHAR(100)    NOT NULL,
    prenom          VARCHAR(100)    NOT NULL,
    poste           VARCHAR(100)    NOT NULL,
    telephone       VARCHAR(30)     NULL,
    email           VARCHAR(254)    NULL,
    salaire_mensuel DECIMAL(12,2)   NOT NULL DEFAULT 0.0,
    date_embauche   DATE            NOT NULL,
    statut          VARCHAR(20)     NOT NULL DEFAULT 'ACTIF',
    notes           TEXT            NULL,
    CONSTRAINT PK_EMPLOYE PRIMARY KEY (id),
    CONSTRAINT UQ_EMPLOYE_USER UNIQUE (user_id),
    CONSTRAINT FK_EMPLOYE_USER FOREIGN KEY (user_id)
        REFERENCES public.authentication_customuser (id)
        ON DELETE SET NULL,
    CONSTRAINT CHK_STATUT_EMPLOYE CHECK (statut IN ('ACTIF', 'INACTIF', 'CONGE'))
);
COMMENT ON TABLE  employes_employe           IS 'Employe de l exploitation agricole - Schema tenant';
COMMENT ON COLUMN employes_employe.user_id   IS 'FK optionnelle vers CustomUser (OneToOne) - compte systeme';
COMMENT ON COLUMN employes_employe.poste     IS 'ex: Chef de culture, Ouvrier agricole, Tractoriste';
COMMENT ON COLUMN employes_employe.statut    IS 'ACTIF | INACTIF | CONGE';

-- Table: TacheEmploye (Tache assignee a un employe)
CREATE TABLE employes_tacheemploye (
    id              BIGSERIAL       NOT NULL,
    employe_id      BIGINT          NOT NULL,
    titre           VARCHAR(150)    NOT NULL,
    description     TEXT            NULL,
    priorite        VARCHAR(20)     NOT NULL DEFAULT 'MOYENNE',
    statut          VARCHAR(20)     NOT NULL DEFAULT 'A_FAIRE',
    date_debut      DATE            NOT NULL,
    date_echeance   DATE            NOT NULL,
    cree_par_id     BIGINT          NULL,
    CONSTRAINT PK_TACHE PRIMARY KEY (id),
    CONSTRAINT FK_TACHE_EMPLOYE FOREIGN KEY (employe_id)
        REFERENCES employes_employe (id)
        ON DELETE CASCADE,
    CONSTRAINT FK_TACHE_USER FOREIGN KEY (cree_par_id)
        REFERENCES public.authentication_customuser (id)
        ON DELETE SET NULL,
    CONSTRAINT CHK_PRIORITE CHECK (priorite IN ('BASSE', 'MOYENNE', 'HAUTE', 'URGENTE')),
    CONSTRAINT CHK_STATUT_TACHE CHECK (statut IN ('A_FAIRE', 'EN_COURS', 'TERMINE', 'ANNULE'))
);
COMMENT ON TABLE  employes_tacheemploye             IS 'Tache assignee a un employe avec suivi de statut - Schema tenant';
COMMENT ON COLUMN employes_tacheemploye.priorite    IS 'BASSE | MOYENNE | HAUTE | URGENTE';
COMMENT ON COLUMN employes_tacheemploye.statut      IS 'A_FAIRE | EN_COURS | TERMINE | ANNULE';

-- Table: Pointage (Suivi presence quotidienne)
CREATE TABLE employes_pointage (
    id                  BIGSERIAL       NOT NULL,
    employe_id          BIGINT          NOT NULL,
    date                DATE            NOT NULL,
    statut              VARCHAR(20)     NOT NULL DEFAULT 'PRESENT',
    heures_travaillees  DECIMAL(4,1)    NOT NULL DEFAULT 8.0,
    notes               TEXT            NULL,
    CONSTRAINT PK_POINTAGE PRIMARY KEY (id),
    CONSTRAINT UQ_POINTAGE_EMP_DATE UNIQUE (employe_id, date),
    CONSTRAINT FK_POINTAGE_EMPLOYE FOREIGN KEY (employe_id)
        REFERENCES employes_employe (id)
        ON DELETE CASCADE,
    CONSTRAINT CHK_STATUT_POINTAGE CHECK (statut IN ('PRESENT', 'ABSENT', 'CONGE'))
);
COMMENT ON TABLE  employes_pointage                    IS 'Suivi de presence quotidienne d un employe - Schema tenant';
COMMENT ON COLUMN employes_pointage.statut             IS 'PRESENT | ABSENT | CONGE';
COMMENT ON COLUMN employes_pointage.heures_travaillees IS 'Nombre d heures travaillees dans la journee';

-- Table: Parcelle (Terrain agricole)
CREATE TABLE cultures_parcelle (
    id          BIGSERIAL       NOT NULL,
    nom         VARCHAR(100)    NOT NULL,
    superficie  DECIMAL(8,2)    NOT NULL,
    type_sol    VARCHAR(100)    NULL,
    localisation VARCHAR(150)   NULL,
    CONSTRAINT PK_PARCELLE PRIMARY KEY (id)
);
COMMENT ON TABLE  cultures_parcelle              IS 'Parcelle de terrain agricole - Schema tenant';
COMMENT ON COLUMN cultures_parcelle.nom          IS 'ex: Parcelle Nord, Champ A';
COMMENT ON COLUMN cultures_parcelle.superficie   IS 'Superficie en Hectares';
COMMENT ON COLUMN cultures_parcelle.type_sol     IS 'ex: Argileux, Ferralitique, Limoneux';

-- Table: Culture (Suivi culture vegetale)
CREATE TABLE cultures_culture (
    id                  BIGSERIAL       NOT NULL,
    parcelle_id         BIGINT          NOT NULL,
    variete             VARCHAR(100)    NOT NULL,
    type_culture        VARCHAR(30)     NOT NULL DEFAULT 'VIVRIERE',
    date_semis          DATE            NOT NULL,
    date_recolte_prevue DATE            NULL,
    quantite_semee      DECIMAL(10,2)   NOT NULL DEFAULT 0.0,
    rendement_estime    DECIMAL(10,2)   NOT NULL DEFAULT 0.0,
    statut              VARCHAR(30)     NOT NULL DEFAULT 'EN_CROISSANCE',
    notes               TEXT            NULL,
    CONSTRAINT PK_CULTURE PRIMARY KEY (id),
    CONSTRAINT FK_CULTURE_PARCELLE FOREIGN KEY (parcelle_id)
        REFERENCES cultures_parcelle (id)
        ON DELETE CASCADE,
    CONSTRAINT CHK_TYPE_CULTURE CHECK (type_culture IN ('VIVRIERE', 'RENTE', 'MARAICHERE')),
    CONSTRAINT CHK_STATUT_CULTURE CHECK (statut IN ('EN_CROISSANCE', 'RECOLTE_EN_COURS', 'TERMINEE', 'PERDUE'))
);
COMMENT ON TABLE  cultures_culture                   IS 'Suivi de culture vegetale - Schema tenant';
COMMENT ON COLUMN cultures_culture.variete           IS 'ex: Mais hybride, Cacao Trinitario, Bananier Plantain';
COMMENT ON COLUMN cultures_culture.type_culture      IS 'VIVRIERE | RENTE | MARAICHERE';
COMMENT ON COLUMN cultures_culture.quantite_semee    IS 'Quantite semee en kg ou Plants';
COMMENT ON COLUMN cultures_culture.rendement_estime  IS 'Rendement estime en Tonnes ou kg';
COMMENT ON COLUMN cultures_culture.statut            IS 'EN_CROISSANCE | RECOLTE_EN_COURS | TERMINEE | PERDUE';

-- Table: Elevage (Suivi elevage animal)
CREATE TABLE cultures_elevage (
    id              BIGSERIAL       NOT NULL,
    type_animaux    VARCHAR(100)    NOT NULL,
    nombre_tetes    INTEGER         NOT NULL DEFAULT 0,
    date_acquisition DATE           NOT NULL,
    batiment        VARCHAR(100)    NULL,
    statut_sanitaire VARCHAR(100)   NOT NULL DEFAULT 'Bon',
    notes           TEXT            NULL,
    CONSTRAINT PK_ELEVAGE PRIMARY KEY (id)
);
COMMENT ON TABLE  cultures_elevage                   IS 'Suivi de l elevage animal - Schema tenant';
COMMENT ON COLUMN cultures_elevage.type_animaux      IS 'ex: Poulets de chair, Porcs, Pondeuses, Bovins';
COMMENT ON COLUMN cultures_elevage.batiment          IS 'ex: Poulailler 1, Enclos B';
COMMENT ON COLUMN cultures_elevage.statut_sanitaire  IS 'ex: Vaccinations a jour, Traitement en cours';

-- Table: ActiviteAgricole (Rapport quotidien activites terrain)
CREATE TABLE cultures_activiteagricole (
    id                      BIGSERIAL       NOT NULL,
    culture_id              BIGINT          NULL,
    elevage_id              BIGINT          NULL,
    employe_responsable_id  BIGINT          NULL,
    type_activite           VARCHAR(100)    NOT NULL,
    date_activite           DATE            NOT NULL,
    description             TEXT            NOT NULL,
    cout_associe            DECIMAL(10,2)   NOT NULL DEFAULT 0.0,
    CONSTRAINT PK_ACTIVITE PRIMARY KEY (id),
    CONSTRAINT FK_ACTIVITE_CULTURE FOREIGN KEY (culture_id)
        REFERENCES cultures_culture (id)
        ON DELETE CASCADE,
    CONSTRAINT FK_ACTIVITE_ELEVAGE FOREIGN KEY (elevage_id)
        REFERENCES cultures_elevage (id)
        ON DELETE CASCADE,
    CONSTRAINT FK_ACTIVITE_EMPLOYE FOREIGN KEY (employe_responsable_id)
        REFERENCES employes_employe (id)
        ON DELETE SET NULL
);
COMMENT ON TABLE  cultures_activiteagricole                       IS 'Rapport quotidien des activites de terrain - Schema tenant';
COMMENT ON COLUMN cultures_activiteagricole.type_activite         IS 'ex: Desherbage, Semis, Traitement phytosanitaire, Recolte, Vaccination';
COMMENT ON COLUMN cultures_activiteagricole.cout_associe          IS 'Cout associe a l activite en FCFA';

-- Table: CategorieStock
CREATE TABLE stocks_categoriestock (
    id          BIGSERIAL       NOT NULL,
    nom         VARCHAR(100)    NOT NULL,
    description TEXT            NULL,
    CONSTRAINT PK_CATSTOCK PRIMARY KEY (id),
    CONSTRAINT UQ_CATSTOCK_NOM UNIQUE (nom)
);
COMMENT ON TABLE stocks_categoriestock IS 'Categorie d article en stock - Schema tenant';

-- Table: ArticleStock
CREATE TABLE stocks_articlestock (
    id                  BIGSERIAL       NOT NULL,
    categorie_id        BIGINT          NULL,
    nom                 VARCHAR(150)    NOT NULL,
    type_article        VARCHAR(30)     NOT NULL DEFAULT 'INTRANT',
    quantite_en_stock   DECIMAL(12,2)   NOT NULL DEFAULT 0.0,
    seuil_alerte        DECIMAL(12,2)   NOT NULL DEFAULT 10.0,
    unite_mesure        VARCHAR(30)     NOT NULL DEFAULT 'kg',
    prix_unitaire_moyen DECIMAL(12,2)   NOT NULL DEFAULT 0.0,
    emplacement         VARCHAR(100)    NULL,
    created_at          TIMESTAMP       NOT NULL,
    updated_at          TIMESTAMP       NOT NULL,
    CONSTRAINT PK_ARTICLE PRIMARY KEY (id),
    CONSTRAINT FK_ARTICLE_CATEGORIE FOREIGN KEY (categorie_id)
        REFERENCES stocks_categoriestock (id)
        ON DELETE SET NULL,
    CONSTRAINT CHK_TYPE_ARTICLE CHECK (type_article IN ('INTRANT', 'RECOLTE', 'EQUIPEMENT', 'ALIMENTATION', 'AUTRE'))
);
COMMENT ON TABLE  stocks_articlestock                    IS 'Article en stock (intrant, recolte, equipement...) - Schema tenant';
COMMENT ON COLUMN stocks_articlestock.type_article       IS 'INTRANT | RECOLTE | EQUIPEMENT | ALIMENTATION | AUTRE';
COMMENT ON COLUMN stocks_articlestock.seuil_alerte       IS 'Seuil minimum declenchant l alerte de reapprovisionnement';
COMMENT ON COLUMN stocks_articlestock.prix_unitaire_moyen IS 'Prix unitaire moyen en FCFA';
COMMENT ON COLUMN stocks_articlestock.emplacement        IS 'ex: Magasin principal, Hangar B';

-- Table: MouvementStock
CREATE TABLE stocks_mouvementstock (
    id              BIGSERIAL       NOT NULL,
    article_id      BIGINT          NOT NULL,
    type_mouvement  VARCHAR(20)     NOT NULL DEFAULT 'ENTREE',
    quantite        DECIMAL(12,2)   NOT NULL,
    prix_total      DECIMAL(12,2)   NOT NULL DEFAULT 0.0,
    motif           VARCHAR(255)    NULL,
    date_mouvement  DATE            NOT NULL,
    effectue_par_id BIGINT          NULL,
    CONSTRAINT PK_MOUVEMENT PRIMARY KEY (id),
    CONSTRAINT FK_MOUVEMENT_ARTICLE FOREIGN KEY (article_id)
        REFERENCES stocks_articlestock (id)
        ON DELETE CASCADE,
    CONSTRAINT FK_MOUVEMENT_USER FOREIGN KEY (effectue_par_id)
        REFERENCES public.authentication_customuser (id)
        ON DELETE SET NULL,
    CONSTRAINT CHK_TYPE_MOUVEMENT CHECK (type_mouvement IN ('ENTREE', 'SORTIE', 'PERTE'))
);
COMMENT ON TABLE  stocks_mouvementstock                  IS 'Mouvement entree/sortie/perte de stock - Schema tenant';
COMMENT ON COLUMN stocks_mouvementstock.type_mouvement   IS 'ENTREE | SORTIE | PERTE';
COMMENT ON COLUMN stocks_mouvementstock.prix_total       IS 'Montant total du mouvement en FCFA';
COMMENT ON COLUMN stocks_mouvementstock.motif            IS 'ex: Achats engrais NPK, Semis du Champ Nord';

-- Table: CategorieTransaction
CREATE TABLE finances_categorietransaction (
    id              BIGSERIAL       NOT NULL,
    nom             VARCHAR(100)    NOT NULL,
    type_categorie  VARCHAR(20)     NOT NULL DEFAULT 'DEPENSE',
    description     TEXT            NULL,
    CONSTRAINT PK_CATTRANS PRIMARY KEY (id),
    CONSTRAINT CHK_TYPE_CATTRANS CHECK (type_categorie IN ('RECETTE', 'DEPENSE'))
);
COMMENT ON TABLE  finances_categorietransaction               IS 'Categorie de transaction financiere - Schema tenant';
COMMENT ON COLUMN finances_categorietransaction.type_categorie IS 'RECETTE | DEPENSE';

-- Table: Transaction
CREATE TABLE finances_transaction (
    id              BIGSERIAL       NOT NULL,
    categorie_id    BIGINT          NULL,
    type_transaction VARCHAR(20)    NOT NULL DEFAULT 'VENTE',
    montant         DECIMAL(14,2)   NOT NULL,
    description     VARCHAR(255)    NOT NULL,
    date_transaction DATE           NOT NULL,
    mode_paiement   VARCHAR(50)     NOT NULL DEFAULT 'CASH',
    reference_recu  VARCHAR(100)    NULL,
    justificatif_photo VARCHAR(100) NULL,
    cree_par_id     BIGINT          NULL,
    created_at      TIMESTAMP       NOT NULL,
    CONSTRAINT PK_TRANSACTION PRIMARY KEY (id),
    CONSTRAINT FK_TRANSACTION_CATEGORIE FOREIGN KEY (categorie_id)
        REFERENCES finances_categorietransaction (id)
        ON DELETE SET NULL,
    CONSTRAINT FK_TRANSACTION_USER FOREIGN KEY (cree_par_id)
        REFERENCES public.authentication_customuser (id)
        ON DELETE SET NULL,
    CONSTRAINT CHK_TYPE_TRANSACTION CHECK (type_transaction IN ('VENTE', 'ACHAT', 'DEPENSE', 'REVENU')),
    CONSTRAINT CHK_MODE_PAIEMENT CHECK (mode_paiement IN ('CASH', 'MOBILE_MONEY', 'VIREMENT', 'CHEQUE'))
);
COMMENT ON TABLE  finances_transaction                    IS 'Transaction financiere (vente, achat, depense, revenu) - Schema tenant';
COMMENT ON COLUMN finances_transaction.montant            IS 'Montant en FCFA';
COMMENT ON COLUMN finances_transaction.type_transaction   IS 'VENTE | ACHAT | DEPENSE | REVENU';
COMMENT ON COLUMN finances_transaction.mode_paiement      IS 'CASH | MOBILE_MONEY | VIREMENT | CHEQUE';
COMMENT ON COLUMN finances_transaction.reference_recu     IS 'Numero de recu ou reference Mobile Money';

-- Table: AuditLog (Journal tracabilite immutable)
CREATE TABLE tracabilite_auditlog (
    id                  BIGSERIAL       NOT NULL,
    utilisateur_id      BIGINT          NULL,
    nom_utilisateur     VARCHAR(150)    NULL,
    role_utilisateur    VARCHAR(50)     NULL,
    type_action         VARCHAR(20)     NOT NULL DEFAULT 'CREATION',
    module              VARCHAR(100)    NOT NULL,
    description         TEXT            NOT NULL,
    ip_address          VARCHAR(45)     NULL,
    created_at          TIMESTAMP       NOT NULL,
    CONSTRAINT PK_AUDITLOG PRIMARY KEY (id),
    CONSTRAINT FK_AUDITLOG_USER FOREIGN KEY (utilisateur_id)
        REFERENCES public.authentication_customuser (id)
        ON DELETE SET NULL,
    CONSTRAINT CHK_TYPE_ACTION CHECK (type_action IN ('CREATION', 'MODIFICATION', 'SUPPRESSION', 'CONNEXION', 'EXPORT'))
);
COMMENT ON TABLE  tracabilite_auditlog                 IS 'Journal de tracabilite immutable des actions utilisateurs - Schema tenant';
COMMENT ON COLUMN tracabilite_auditlog.nom_utilisateur IS 'Snapshot du nom au moment de l action (conserve meme si user supprime)';
COMMENT ON COLUMN tracabilite_auditlog.type_action     IS 'CREATION | MODIFICATION | SUPPRESSION | CONNEXION | EXPORT';
COMMENT ON COLUMN tracabilite_auditlog.module          IS 'ex: Stocks, Cultures, Employes, Finances';

-- Table: Notification (Notifications in-app)
CREATE TABLE tracabilite_notification (
    id              BIGSERIAL       NOT NULL,
    utilisateur_id  BIGINT          NOT NULL,
    titre           VARCHAR(150)    NOT NULL,
    message         TEXT            NOT NULL,
    type_notif      VARCHAR(50)     NOT NULL DEFAULT 'INFO',
    est_lu          BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP       NOT NULL,
    CONSTRAINT PK_NOTIFICATION PRIMARY KEY (id),
    CONSTRAINT FK_NOTIFICATION_USER FOREIGN KEY (utilisateur_id)
        REFERENCES public.authentication_customuser (id)
        ON DELETE CASCADE,
    CONSTRAINT CHK_TYPE_NOTIF CHECK (type_notif IN ('INFO', 'ALERTE', 'TACHE', 'STOCK'))
);
COMMENT ON TABLE  tracabilite_notification             IS 'Notifications in-app pour l utilisateur - Schema tenant';
COMMENT ON COLUMN tracabilite_notification.type_notif  IS 'INFO | ALERTE | TACHE | STOCK';
COMMENT ON COLUMN tracabilite_notification.est_lu      IS 'FALSE = non lue, TRUE = lue par l utilisateur';

-- ============================================================
-- FIN DU SCRIPT DDL
-- AgriSuivi - Platform SaaS Agricole Cameroun
-- ============================================================
