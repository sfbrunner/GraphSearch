## article nodes
pmid:ID,year:int,month,journal,journal_iso,title,authors,pmcid,:LABEL

1,1975,Jun,Biochemical medicine,Biochem Med,Formate assay in body fluids: application in methanol poisoning.,"Makar A B, McMartin K E, Palese M, Tephly T R",
1,1975,"Jun","Biochemical medicine","Biochem Med","Formate assay in body fluids: application in methanol poisoning.","Makar A B, McMartin K E, Palese M, Tephly T R","","ARTICLE"

## article edges
:START_ID,:END_ID,:TYPE

## journal nodes
journal_id:ID,journal,journal_iso,:LABEL

## journal edges
:START_ID,:END_ID,:TYPE

## Command
sudo neo4j-admin import --database=graphsearch1 \
    --nodes="article_nodes_header.csv,article_nodes.csv" \
    --nodes="journal_nodes_header.csv,journal_nodes.csv" \
    --relationships="article_edges_header.csv,article_edges.csv" \
    --relationships="journal_edges_header.csv,journal_edges.csv" \
    --ignore-missing-nodes=true \
    --quote="" \
    --delimiter=, \
    --report-file=/dev/null \
    --id-type=STRING \
    --multiline-fields=true

IMPORT DONE in 15m 51s 908ms.
Imported:
  9633062 nodes
  56676527 relationships
  76536837 properties
Peak memory usage: 608.11 MB
There were bad entries which were skipped and logged into /dev/null


sudo neo4j-admin import --database=graphsearch1 \
    --nodes="article_nodes_header.csv,article_nodes.csv" \
    --relationships="article_edges_header.csv,article_edges.csv" \
    --ignore-missing-nodes=true \
    --quote="" \
    --delimiter=, \
    --report-file=/dev/null \
    --id-type=STRING \
    --multiline-fields=true

IMPORT DONE in 19m 38s 93ms.
Imported:
  9615470 nodes
  47061058 relationships
  76484061 properties
Peak memory usage: 607.94 MB
There were bad entries which were skipped and logged into /dev/null


IMPORT DONE in 13m 56s 374ms.
Imported:
  9615470 nodes
  47061058 relationships
  76484061 properties
Peak memory usage: 607.94 MB
There were bad entries which were skipped and logged into /dev/null


IMPORT DONE in 13m 47s 69ms.
Imported:
  9615470 nodes
  47061058 relationships
  76484061 properties
Peak memory usage: 607.94 MB
There were bad entries which were skipped and logged into /dev/null

# Import without metadata
sudo neo4j-admin import --database=graphsearch1 \
    --nodes="article_nodes_header_nometa.csv,article_nodes_nometa.csv" \
    --nodes="journal_nodes_header.csv,journal_nodes.csv" \
    --relationships="article_edges_header.csv,article_edges.csv" \
    --relationships="journal_edges_header.csv,journal_edges.csv" \
    --ignore-missing-nodes=true \
    --quote="" \
    --delimiter=, \
    --report-file=/home/ubuntu/data/neo4j_upload/logs/log_nometa.txt \
    --id-type=STRING \
    --multiline-fields=true

# QUERY EXAMPLES
CREATE INDEX ON :ARTICLE(pmid)
CREATE INDEX ON :ARTICLE(pmcid)
CREATE INDEX ON :JOURNAL(journal_id)

MATCH (n:ARTICLE { pmcid: 'PMC3414841' })-[k:CITES]->(r:ARTICLE) RETURN n,k,r;
MATCH (n:ARTICLE)-[r:CITES]->(k:ARTICLE) WHERE n.pmcid IN ['PMC4910866', 'PMC3428862'] RETURN n,r,k;
MATCH (n:ARTICLE { pmcid: 'PMC3414841' })-[r:CITES]->(k:ARTICLE) WHERE size((n)-[*2]->(k))>1 RETURN n,r,k;
MATCH (n:ARTICLE { pmcid: 'PMC3414841' })-[k:CITES]->(r:ARTICLE) MATCH (j:JOURNAL)-[p:PUBLISHED]->(n) MATCH (j2:JOURNAL)-[p2:PUBLISHED]->(r) RETURN n,k,r,j,p,j2,p2;
MATCH (k:ARTICLE)-[r:CITES]->(n:ARTICLE { pmcid: 'PMC3414841' }) WITH k, r, n LIMIT 10 MATCH (n)-[r2:CITES]->(k2:ARTICLE) MATCH (j1)-[p1:PUBLISHED]->(n) MATCH (j2)-[p2:PUBLISHED]->(k) MATCH (j3)-[p3:PUBLISHED]->(k2) RETURN n, r, r2, k, k2, j1, j2, j3, p1, p2, p3;

