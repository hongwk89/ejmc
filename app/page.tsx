"use client";
import axios from "axios";
import { useRef, useEffect } from "react";
import styled from "styled-components";

interface mapInfo {
  bjdCode: string;
  latitude: string;
  longitude: string;
  districtNmSimple: string;
  districtNm: string;
  reDevelopmentCnt: number;
  reConstructionCnt: number;
  streetHouseCnt: number;
  maintenanceSmallCnt: number;
  collectHouseCnt: number;
}

const NaverMap = styled.div`
  width: 100%;
  height: 100vh;
`;

export default function Home() {
  const mapLevel = useRef(1);
  const datum = useRef<mapInfo[]>();

  useEffect(() => {
    const map = new naver.maps.Map("map", { zoom: 8 });

    const getData = async () => {
      const config = {
        method: "post",
        url: "https://dev-api.wooriga.kr/api/web/bizZone/list/district",
        headers: {
          "X-Client-Id": "WoOrIgA2021",
        },
        data: {
          level: mapLevel.current,
          neLat: map.getBounds().maxY(),
          neLng: map.getBounds().maxX(),
          swLat: map.getBounds().minY(),
          swLng: map.getBounds().minX(),
        },
      };

      const res = await axios(config);

      res.data.map((info: mapInfo) => {
        if (datum.current?.filter((e) => e.bjdCode === info.bjdCode).length) {
          return;
        }

        const cntArr = [
          { name: "재개발", cnt: info.reDevelopmentCnt },
          { name: "재건축", cnt: info.reConstructionCnt },
          { name: "가로주택", cnt: info.streetHouseCnt },
          { name: "소규모재건축", cnt: info.maintenanceSmallCnt },
          { name: "도시개발(환지)", cnt: info.collectHouseCnt },
        ];

        const cntAll = cntArr.reduce((acc, cur) => acc + cur.cnt, 0);
        const listCnt = cntArr.reduce(
          (acc, cur) => (cur.cnt !== 0 ? acc + 1 : acc),
          0
        );

        if (cntAll === 0) return;

        const content = [
          '<div class="marker_wrap">',
          '<div class="marker">',
          '<div class="name_cnt">',
          '<span class="districtName">' +
            (info.districtNmSimple ?? info.districtNm),
          "</span>",
          '<span class="districtCount">' + cntAll,
          "</span>",
          "</div>",
          '<div class="detail' +
            (listCnt < 2 ? " less" : "") +
            (listCnt > 4 ? " over" : "") +
            '">',
        ];

        cntArr.map((data) => {
          if (data.cnt !== 0) {
            content.push(
              "<div>",
              "<span>" + data.name,
              "</span>",
              "<span>" + data.cnt,
              "</span>",
              "</div>"
            );
          }
        });

        content.push("</div>", "</div>", "</div>");

        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(
            parseFloat(info.latitude),
            parseFloat(info.longitude)
          ),
          map: map,
          icon: {
            content: content.join(""),
            size: new naver.maps.Size(38, 58),
            anchor: new naver.maps.Point(19, 58),
          },
        });

        naver.maps.Event.addListener(marker, "click", function (e) {
          map.morph(e.overlay.position, 12);
        });
      });

      datum.current = res.data;
    };

    getData();

    naver.maps.Event.addListener(map, "dragend", () => {
      getData();
    });

    naver.maps.Event.addListener(map, "zoom_changed", (zoom) => {
      if (zoom >= 12) mapLevel.current = 2;
      else mapLevel.current = 1;

      document.querySelectorAll(".marker").forEach((e) => e.remove());
      datum.current = [];
      getData();
    });
  }, []);

  return (
    <main>
      <NaverMap id="map"></NaverMap>
    </main>
  );
}
