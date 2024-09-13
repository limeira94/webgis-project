import React, { useState } from 'react';
import axios from 'axios';
import { IconButton, Tooltip, Snackbar } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';

const API_URL = process.env.REACT_APP_API_URL;

const ShareButton = ({ projectId }) => {
    const [shareLink, setShareLink] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);

    const handleShare = async (e) => {
        e.preventDefault(); 
        try {
            // Chama a URL que gera o token de compartilhamento com base no projectId
            const response = await axios.get(`${API_URL}api/main/projects/${projectId}/share/`);

            // Construa o link de compartilhamento com o token retornado
            const generatedLink = `${window.location.origin}/share/${response.data.token}`;
            setShareLink(generatedLink);

            // Copia o link para a área de transferência
            navigator.clipboard.writeText(generatedLink);

            // Exibe o snackbar de confirmação
            setLinkCopied(true);
        } catch (error) {
            console.error("Erro ao gerar link de compartilhamento:", error);
        }
    };

    const handleCloseSnackbar = () => {
        setLinkCopied(false);
    };

    return (
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
            <Tooltip title="Compartilhar Projeto">
                <IconButton
                    onClick={handleShare}
                    style={{
                        backgroundColor: '#fff',
                        boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)',
                        color: '#000',
                        borderRadius: '8px',
                        width: '40px', // Largura do botão
                        height: '40px', // Altura do botão
                    }}
                >
                    <ShareIcon />
                </IconButton>
            </Tooltip>
            <Snackbar
                open={linkCopied}
                autoHideDuration={3000} // A mensagem será exibida por 3 segundos
                onClose={handleCloseSnackbar}
                message="O link foi copiado com sucesso"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Posição do Snackbar
                sx={{width:'50%'}}
            />

        </div>
    );
};

export default ShareButton;
