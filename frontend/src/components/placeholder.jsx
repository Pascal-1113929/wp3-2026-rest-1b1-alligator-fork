const Placeholder = ({ data }) => {
    return ( 
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold">Placeholder pagina</h1>
            <p>Deze pagina is een tijdelijke placeholder voor niet-geimplementeerde functionaliteit.</p>
            <p>Bechikbare data: {data}</p>
        </div>
     );
}
 
export default Placeholder;