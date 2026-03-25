import type {
  KakaoPostcodeCloseState,
  KakaoPostcodeCompleteEvent,
} from "@cp949/kakao-postcode-react";
import { KakaoPostcodeEmbed } from "@cp949/kakao-postcode-react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

const IFRAME_HEIGHT = 470;

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
  const title = "주소 검색";

  const handleDialogClose = () => {
    onClose();
  };

  const handleProviderClose = (state: KakaoPostcodeCloseState) => {
    if (state !== "COMPLETE_CLOSE") {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ py: 1.5, pl: 2, pr: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography component="span" variant="h6">
            {title}
          </Typography>
          <Button size="small" onClick={handleDialogClose}>
            닫기
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ minHeight: IFRAME_HEIGHT, p: 0 }}>
        <KakaoPostcodeEmbed
          q="판교역"
          autoClose
          height={IFRAME_HEIGHT}
          width="100%"
          style={{ width: "100%" }}
          loadingFallback={
            <Typography sx={{ p: 2 }}>{`${title}...`}</Typography>
          }
          errorFallback={
            <Typography color="error" sx={{ p: 2 }}>
              주소 검색을 불러오지 못했습니다.
            </Typography>
          }
          onClose={handleProviderClose}
          onComplete={onComplete}
        />
      </DialogContent>
    </Dialog>
  );
}
