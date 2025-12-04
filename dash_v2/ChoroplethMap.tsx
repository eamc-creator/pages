import { useEffect, useRef, useState } from "react";
import { MapView } from "./Map";

interface ChoroplethMapProps {
  data: any[];
  year: string;
}

export default function ChoroplethMap({ data, year }: ChoroplethMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [geoJsonLoaded, setGeoJsonLoaded] = useState(false);

  // Função para determinar a cor com base na nota
  const getColorForValue = (value: number) => {
    if (value >= 0.90) return "#22c55e"; // A - Green
    if (value >= 0.75) return "#84cc16"; // B+ - Light Green
    if (value >= 0.60) return "#eab308"; // B - Yellow
    if (value >= 0.40) return "#facc15"; // C+ - Light Yellow
    return "#f87171"; // C - Red
  };

  const onMapReady = (map: google.maps.Map) => {
    mapRef.current = map;

    // Carregar GeoJSON
    const geoJsonUrl = "/data/sc_municipios.json";
    map.data.loadGeoJson(geoJsonUrl, { idPropertyName: "codarea" }, (features) => {
      setGeoJsonLoaded(true);
      
      // Ajustar zoom para mostrar todo o estado
      const bounds = new google.maps.LatLngBounds();
      features.forEach((feature) => {
        feature.getGeometry()?.forEachLatLng((latlng) => {
          bounds.extend(latlng);
        });
      });
      map.fitBounds(bounds);
    });

    // Configurar estilo inicial
    map.data.setStyle({
      fillColor: "#e5e7eb",
      strokeWeight: 1,
      strokeColor: "#ffffff",
      fillOpacity: 0.7
    });

    // Adicionar tooltip/info window
    const infoWindow = new google.maps.InfoWindow();
    
    map.data.addListener("mouseover", (event: google.maps.Data.MouseEvent) => {
      map.data.revertStyle();
      map.data.overrideStyle(event.feature, { strokeWeight: 2, strokeColor: "#000000" });
      
      const codIbge = event.feature.getProperty("codarea");
      // Encontrar dados do município (ajustando código IBGE se necessário - removendo dígito verificador ou não)
      // O GeoJSON tem 7 dígitos (ex: 4200051), o CSV também tem 7 dígitos
      const municipioData = data.find(d => d.codigo_ibge.toString() === codIbge);
      
      if (municipioData) {
        const content = `
          <div style="padding: 8px; font-family: sans-serif;">
            <h3 style="margin: 0 0 4px 0; font-weight: bold;">${municipioData.municipio}</h3>
            <div style="margin-bottom: 4px;">
              <span style="font-weight: bold;">Nota:</span> ${municipioData.nota_final.toFixed(4)}
            </div>
            <div>
              <span style="font-weight: bold;">Faixa:</span> ${municipioData.faixa_apos_analise_rebaixamento}
            </div>
          </div>
        `;
        
        // Calcular centro do polígono para posicionar o InfoWindow
        const bounds = new google.maps.LatLngBounds();
        event.feature.getGeometry()?.forEachLatLng((latlng) => {
          bounds.extend(latlng);
        });
        
        infoWindow.setContent(content);
        infoWindow.setPosition(bounds.getCenter());
        infoWindow.open(map);
      }
    });

    map.data.addListener("mouseout", () => {
      map.data.revertStyle();
      infoWindow.close();
    });
  };

  // Atualizar estilo quando os dados ou o ano mudarem
  useEffect(() => {
    if (mapRef.current && geoJsonLoaded && data.length > 0) {
      mapRef.current.data.setStyle((feature) => {
        const codIbge = feature.getProperty("codarea");
        const municipioData = data.find(d => d.codigo_ibge.toString() === codIbge);
        
        let fillColor = "#e5e7eb"; // Cor padrão (sem dados)
        
        if (municipioData) {
          fillColor = getColorForValue(municipioData.nota_final);
        }

        return {
          fillColor: fillColor,
          strokeWeight: 0.5,
          strokeColor: "#ffffff",
          fillOpacity: 0.8
        };
      });
    }
  }, [data, year, geoJsonLoaded]);

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-border shadow-sm">
      <MapView 
        onMapReady={onMapReady}
        initialCenter={{ lat: -27.2423, lng: -50.2189 }} // Centro aproximado de SC
        initialZoom={8}
      />
    </div>
  );
}
