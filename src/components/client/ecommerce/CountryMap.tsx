import { worldMill } from "@react-jvectormap/world";
import { VectorMap } from "@react-jvectormap/core";

// export default function CountryMap() {
//   return (
//     <VectorMap
//       map={worldMill}
//       backgroundColor="transparent"
//       markerStyle={{
//         initial: {
//           fill: "#465FFF",
//         },
//       }}
//       markersSelectable={true}
//       markers={[
//         {
//           latLng: [50.83333333, 4],
//           name: "United States",
//           style: {
//             fill: "#465FFF",
//             borderWidth: 1,
//             borderColor: "white",
//             stroke: "#383f47",
//           },
//         },
//         {
//           latLng: [20.7504374, 73.7276105],
//           name: "India",
//           style: { fill: "#465FFF", borderWidth: 1, borderColor: "white" },
//         },
//         {
//           latLng: [53.613, -11.6368],
//           name: "United Kingdom",
//           style: { fill: "#465FFF", borderWidth: 1, borderColor: "white" },
//         },
//         {
//           latLng: [-25.0304388, 115.2092761],
//           name: "Sweden",
//           style: {
//             fill: "#465FFF",
//             borderWidth: 1,
//             borderColor: "white",
//             strokeOpacity: 0,
//           },
//         },
//       ]}
//       zoomOnScroll={false}
//       zoomMax={12}
//       zoomMin={1}
//       zoomAnimate={true}
//       zoomStep={1.5}
//       regionStyle={{
//         initial: {
//           fill: "#D0D5DD",
//           fillOpacity: 1,
//           fontFamily: "Outfit",
//           stroke: "none",
//           strokeWidth: 0,
//           strokeOpacity: 0,
//         },
//         hover: {
//           fillOpacity: 0.7,
//           cursor: "pointer",
//           fill: "#465fff",
//           stroke: "none",
//         },
//         selected: {
//           fill: "#465FFF",
//         },
//         selectedHover: {},
//       }}
//       regionLabelStyle={{
//         initial: {
//           fill: "#35373e",
//           fontWeight: 500,
//           fontSize: "13px",
//           stroke: "none",
//         },
//         hover: {},
//         selected: {},
//         selectedHover: {},
//       }}
//     />
//   );
// }

interface CountryData {
  nameCountry: string;
  totalDebit: number;
  totalBill: number;
  percentage: number;
  latLng: [number, number];
}

interface CountryMapProps {
  countries: CountryData[];
}

export default function CountryMap({ countries }: CountryMapProps) {
  // Tạo marker động từ dữ liệu truyền vào
  console.table(countries);
  const markers = countries
    .filter(country => country.latLng && country.latLng[0] !== 0)
    .map(country => ({
      latLng: country.latLng,
      name: `${country.nameCountry}: ${country.totalBill} đơn`,
      style: {
        fill: "#465FFF",
        borderWidth: 1,
        borderColor: "white",
      },
    }));



  // const markers = [
  //   {
  //     latLng: [50.83333333, 4],
  //     name: "Test Marker",
  //     style: {
  //       fill: "#465FFF",
  //       borderWidth: 1,
  //       borderColor: "white",
  //     },
  //   },
  // ];


  markers.push({
    latLng: [-10, -55],
    name: "USA Marker Test",
    style: {
      fill: "red",
      borderColor: "white",
      borderWidth: 1,
    },
  });
  console.table(markers);

  return (
    <VectorMap
      map={worldMill}
      backgroundColor="transparent"
      markerStyle={{
        initial: {
          fill: "#465FFF",
        },
      }}
      markersSelectable={true}
      markers={markers}
      zoomOnScroll={false}
      zoomMax={12}
      zoomMin={1}
      zoomAnimate={true}
      zoomStep={1.5}
      regionStyle={{
        initial: {
          fill: "#D0D5DD",
          fillOpacity: 1,
          fontFamily: "Outfit",
          stroke: "none",
          strokeWidth: 0,
          strokeOpacity: 0,
        },
        hover: {
          fillOpacity: 0.7,
          cursor: "pointer",
          fill: "#465fff",
          stroke: "none",
        },
        selected: {
          fill: "#465FFF",
        },
        selectedHover: {},
      }}
      regionLabelStyle={{
        initial: {
          fill: "#35373e",
          fontWeight: 500,
          fontSize: "13px",
          stroke: "none",
        },
        hover: {},
        selected: {},
        selectedHover: {},
      }}
    />
  );
}

