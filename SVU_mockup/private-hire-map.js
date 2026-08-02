(() => {
    const mapElement = document.querySelector("[data-campus-map]");
    const canvas = mapElement?.querySelector("[data-campus-map-canvas]");

    if (!mapElement || !canvas || typeof L === "undefined") return;

    const atcLocation = [-37.82267, 145.0384];
    const map = L.map(canvas, {
        center: atcLocation,
        zoom: 17,
        zoomControl: false,
        scrollWheelZoom: false,
    });

    map.createPane("campus-map-labels");
    map.getPane("campus-map-labels").style.zIndex = 450;
    map.getPane("campus-map-labels").style.pointerEvents = "none";

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
        maxZoom: 20,
    }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png", {
        pane: "campus-map-labels",
        maxZoom: 20,
    }).addTo(map);

    const markerIcon = L.divIcon({
        className: "campus-map__marker-wrap",
        html: '<span class="campus-map__marker" aria-hidden="true"></span>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });

    L.marker(atcLocation, {
        icon: markerIcon,
        keyboard: true,
        alt: "Advanced Technologies Centre — Swinburne Virtual Universe",
        title: "Advanced Technologies Centre — Swinburne Virtual Universe",
    })
        .addTo(map)
        .bindTooltip("Advanced Technologies Centre — SVU", {
            permanent: true,
            direction: "top",
            offset: [0, -16],
        });

    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapElement.classList.add("is-ready");

    window.requestAnimationFrame(() => map.invalidateSize());
    window.addEventListener("resize", () => map.invalidateSize(), { passive: true });
})();
