import { Box, Chip, Container, Stack, Typography } from "@mui/material";
import { DialogExampleCard } from "./components/DialogExampleCard";
import { ExampleCodeCard } from "./components/ExampleCodeCard";

const stats = [
  { label: "Flow", value: "Dialog open -> select -> return" },
  { label: "Focus", value: "한 번의 선택으로 호출자 상태까지 연결" },
  { label: "Use case", value: "로컬 검증용 쇼케이스" },
];

export default function App() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(38, 113, 255, 0.22), transparent 30%), radial-gradient(circle at 85% 12%, rgba(255, 153, 102, 0.18), transparent 24%), linear-gradient(180deg, #fcfdff 0%, #eef3f8 52%, #e7eef8 100%)",
        py: { xs: 4, md: 7 },
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={{ xs: 3, md: 4.5 }}>
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: { xs: 4, md: 6 },
              px: { xs: 2.5, md: 5 },
              py: { xs: 3, md: 4.5 },
              border: "1px solid rgba(255,255,255,0.7)",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.88), rgba(244,248,255,0.78))",
              boxShadow: "0 24px 80px rgba(38, 72, 115, 0.14)",
              backdropFilter: "blur(14px)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                right: { xs: -30, md: 36 },
                top: { xs: -40, md: -28 },
                width: { xs: 120, md: 220 },
                height: { xs: 120, md: 220 },
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255, 162, 93, 0.35), rgba(255, 162, 93, 0))",
                pointerEvents: "none",
              }}
            />
            <Box
              sx={{
                display: "grid",
                gap: { xs: 3, md: 4 },
                alignItems: "end",
                gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.5fr) minmax(280px, 0.9fr)" },
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
                  <Chip label="kakao-postcode-react" color="primary" />
                  <Chip label="MUI Dialog demo" variant="outlined" />
                </Stack>
                <Stack spacing={1.5}>
                  <Typography variant="overline" color="primary.main" sx={{ letterSpacing: "0.18em" }}>
                    demo showcase
                  </Typography>
                  <Typography variant="h2" sx={{ maxWidth: 760 }}>
                    주소 검색을 가장 빠르게 붙여보는 방법
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
                    Dialog 안에서 검색을 열고, 선택이 끝나는 순간 결과를 호출자 상태로 되돌리는
                    흐름만 남겼습니다. 실행 예제와 핵심 코드를 같은 화면에서 확인하면서 바로 로컬
                    검증용 쇼케이스로 사용할 수 있습니다.
                  </Typography>
                </Stack>
              </Stack>

              <Stack
                spacing={1.5}
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 4,
                  background: "rgba(16, 31, 54, 0.88)",
                  color: "#eff6ff",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
              >
                <Typography variant="subtitle2" sx={{ color: "rgba(222, 236, 255, 0.86)" }}>
                  Demo summary
                </Typography>
                {stats.map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      display: "grid",
                      gap: 0.5,
                      gridTemplateColumns: { xs: "1fr", sm: "88px 1fr" },
                      py: 0.75,
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "rgba(205, 223, 248, 0.72)" }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 3,
              alignItems: "start",
              gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.08fr) minmax(360px, 0.92fr)" },
            }}
          >
            <DialogExampleCard />
            <ExampleCodeCard />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
