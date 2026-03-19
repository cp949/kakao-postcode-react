import type { KakaoPostcodeCompleteEvent } from "@cp949/kakao-postcode-react";
import { KakaoPostcodeEmbed } from "@cp949/kakao-postcode-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

type AddressSearchDialogProps = {
  open: boolean;
  onClose: () => void;
  onComplete: (event: KakaoPostcodeCompleteEvent) => void;
};

export function AddressSearchDialog({
  open,
  onClose,
  onComplete,
}: AddressSearchDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            overflow: "hidden",
            borderRadius: { xs: 4, sm: 5 },
            border: "1px solid rgba(216, 227, 243, 0.92)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,255,0.98) 100%)",
            boxShadow: "0 32px 80px rgba(16, 28, 48, 0.22)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{ px: { xs: 2, sm: 2.75 }, pt: { xs: 2, sm: 2.5 }, pb: 1.5 }}
      >
        <Stack spacing={1.25}>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Typography variant="h5">주소 검색</Typography>
            <Button
              size="small"
              onClick={onClose}
              variant="outlined"
              sx={{
                flexShrink: 0,
                minWidth: "auto",
                borderColor: "rgba(173, 191, 220, 0.9)",
                backgroundColor: "rgba(255,255,255,0.8)",
              }}
            >
              닫기
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            주소를 선택하면 호출자에게 결과가 반환되고 Dialog가 닫힙니다.
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: 0, backgroundColor: "#f7f9fc" }}>
        <KakaoPostcodeEmbed
          q="판교역"
          height={460}
          style={{ width: "100%", border: "none" }}
          onComplete={onComplete}
        />
      </DialogContent>
    </Dialog>
  );
}
