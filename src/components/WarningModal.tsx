import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
type WarningModalProps = {
  setDisplayWarning: React.Dispatch<React.SetStateAction<boolean>>;
};

const WarningModal = ({ setDisplayWarning }: WarningModalProps) => {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogClose asChild onClick={() => setDisplayWarning(false)}>
          <Button type="button" variant="secondary">
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default WarningModal;
