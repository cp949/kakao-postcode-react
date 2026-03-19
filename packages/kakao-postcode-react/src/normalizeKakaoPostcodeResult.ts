import type { KakaoPostcodeNormalizedResult, KakaoPostcodeRawResult } from "./types";

// 법정동명이 "동", "로", "가"로 끝나는 경우에만
// 참고 주소 표기에 포함할 가치가 있다고 판단한다.
const shouldIncludeBname = (bname: string) => /[동로가]$/u.test(bname);

// 카카오 우편번호 원본 응답을
// 애플리케이션에서 바로 쓰기 쉬운 형태로 변환한다.
export const normalizeKakaoPostcodeResult = (
  raw: KakaoPostcodeRawResult,
): KakaoPostcodeNormalizedResult => {
  // 문자열 비교를 반복하지 않도록 주소 선택 타입을 불리언으로 풀어둔다.
  const isRoadAddress = raw.userSelectedType === "R";
  const isJibunAddress = raw.userSelectedType === "J";

  // 영문 주소가 없는 경우에도 소비자 코드가 null 체크를 하지 않도록 빈 문자열로 맞춘다.
  const englishAddress = raw.addressEnglish ?? "";

  // 도로명 주소 뒤에 붙는 참고 주소 조각들을 순서대로 수집한다.
  const extraAddressParts: string[] = [];

  if (raw.bname && shouldIncludeBname(raw.bname)) {
    extraAddressParts.push(raw.bname);
  }

  if (raw.buildingName && raw.apartment === "Y") {
    extraAddressParts.push(raw.buildingName);
  }

  // 참고 주소가 하나라도 있으면 "(...)" 형식으로 감싸 최종 문자열을 만든다.
  const extraAddress =
    extraAddressParts.length > 0 ? `(${extraAddressParts.join(", ")})` : "";

  // 도로명 전체 주소는 기본 주소와 참고 주소를 결합해 만든다.
  const fullRoadAddress = [raw.roadAddress, extraAddress].filter(Boolean).join(" ");

  // 지번 주소는 현재 원본 값을 그대로 전체 주소로 사용한다.
  const fullJibunAddress = raw.jibunAddress;

  return {
    zonecode: raw.zonecode,
    address: raw.address,
    roadAddress: raw.roadAddress,
    jibunAddress: raw.jibunAddress,
    englishAddress,
    extraAddress,
    fullRoadAddress,
    fullJibunAddress,
    isRoadAddress,
    isJibunAddress,
    userSelectedType: raw.userSelectedType,
    addressType: raw.addressType,
  };
};
