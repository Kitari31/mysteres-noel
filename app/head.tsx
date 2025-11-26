// app/head.tsx
export default function Head() {
    return (
      <>
        <title>🎄 Mystères de Noël</title> {/* Nom de l'onglet */}
        <meta name="description" content="Le défi quotidien de Mystères de Noël" />
  
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
  
        {/* Optionnel : favicon général */}
        <link rel="shortcut icon" href="/logo.png" />
      </>
    );
  }
  