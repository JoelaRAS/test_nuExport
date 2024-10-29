import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import JsonExtractor from './JsonExtractor';

interface JsonFile {
    name: string;
    content: string;
}

interface ExtractedData {
    nom: string;
    prix_unitaire: number;
    quantites: number;
    prix: number;
    total: number;
}

const DataLoader: React.FC = () => {
    const [jsonFiles, setJsonFiles] = useState<JsonFile[]>([]);
    const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);

    useEffect(() => {
        const fetchJsonFiles = async () => {
            try {
                const { data: fileList, error: listError } = await supabase
                    .storage
                    .from('ocr_files')
                    .list('result', { limit: 100 });
                
                if (listError) {
                    console.error('Erreur lors de la récupération de la liste des fichiers JSON:', listError);
                    return;
                }

                console.log('Liste des fichiers JSON récupérés:', fileList);

                const files = await Promise.all(
                    fileList.map(async (file) => {
                        const { data: fileData, error: downloadError } = await supabase
                            .storage
                            .from('ocr_files')
                            .download(`result/${file.name}`);
                        
                        if (downloadError) {
                            console.error(`Erreur lors du téléchargement de ${file.name}:`, downloadError);
                            return null;
                        }

                        const fileText = await fileData?.text();
                        return { name: file.name, content: fileText || '' };
                    })
                );

                const validFiles = files.filter((file): file is JsonFile => file !== null);
                setJsonFiles(validFiles);
                console.log('Contenu des fichiers JSON bruts:', validFiles);

                for (const file of validFiles) {
                    await processFile(file);
                }
                
            } catch (error) {
                console.error('Erreur générale lors de la récupération des JSONs:', error);
            }
        };

        const processFile = async (file: JsonFile) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 600000);
        
            try {
                const response = await fetch("http://127.0.0.1:8000/extract", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    signal: controller.signal,
                    body: JSON.stringify({
                        bucket_name: "ocr_files",
                        folder_path: "result",
                        json_files: [file.content],
                        template: {
                            "nom": "",
                            "prix_unitaire": 0,
                            "quantites": 0,
                            "prix": 0,
                            "total": 0
                        },
                    }),
                });
        
                clearTimeout(timeoutId);
                const extractedResults = await response.json();
                console.log(`Résultats extraits pour ${file.name} :`, extractedResults);
        
                if (extractedResults.extracted_data) {
                    setExtractedData((prevData) => {
                        const newData = [...prevData, ...extractedResults.extracted_data];
                        console.log("Données extraites mises à jour:", newData);
                        return newData;
                    });
                }
                
            } catch (error) {
                console.error(`Erreur lors de l'extraction des données pour ${file.name} :`, error);
            }
        };
        
        fetchJsonFiles();
    }, []);

    return (
        <div>
            <h2>Affichage des JSONs bruts</h2>
            {jsonFiles.map((file, index) => (
                <div key={index}>
                    <h3>Fichier : {file.name}</h3>
                    <pre>{file.content}</pre>
                </div>
            ))}
            
            <h2>Résultats Extraits par NuExtract</h2>
            <JsonExtractor extractedData={extractedData} />
        </div>
    );
};

export default DataLoader;
