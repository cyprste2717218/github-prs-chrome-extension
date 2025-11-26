import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "./ui/slider";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsProps } from "@/models/frontend/StepComponentModels";
import { toast } from "sonner";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
} from "@/utilities/service-worker-funcs/storage-utils";
import { getToast } from "@/utilities/toastMessages.ts";

const SliderMarker = ({ numMinutes }: { numMinutes: number }) => {
  let displayText = <p></p>;

  if (numMinutes === 1) {
    displayText = (
      <p>
        Every <br />
        Minute
      </p>
    );
  } else {
    displayText = (
      <p>
        Every <br />
        {numMinutes} mins
      </p>
    );
  }

  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-col justify-center items-center">
        <Separator orientation="vertical" />
        {displayText}
      </div>
    </div>
  );
};

const AllSliderMarkers = ({ numMinsArr }: { numMinsArr: number[] }) => {
  const [val1, val2, val3] = numMinsArr;

  return (
    <div className="flex flex-row justify-between text-center">
      <SliderMarker numMinutes={val1} />
      <SliderMarker numMinutes={val2} />
      <SliderMarker numMinutes={val3} />
    </div>
  );
};

const SettingsComponent = ({ pollingRate }: SettingsProps) => {
  async function handleSaveSliderToast() {
    const fetchedPollingRate = await loadFromLocalStorage("pollingRate");
    console.log("Setting new polling rate of", fetchedPollingRate);

    const toastMessage = getToast(
      "success",
      "savePollingRate",
      undefined,
      undefined
    );
    return toast.success(toastMessage);
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Tabs defaultValue="configuration">
        <TabsList className="flex w-full">
          <TabsTrigger className="w-full" value="configuration">
            Configuration
          </TabsTrigger>
          <TabsTrigger className="w-full" value="accessibility">
            Accessibility
          </TabsTrigger>
        </TabsList>
        <TabsContent value="configuration">
          <Card>
            <CardContent className="grid gap-6">
              <div className="grid gap-3 text-left">
                <Label className="mt-7" htmlFor="request-rate-slider">
                  Github API Request Rate (per min)
                </Label>
                <CardDescription>
                  Note: Applies only to requests made with a Personal Access
                  Token
                </CardDescription>
                <Slider
                  defaultValue={[pollingRate]}
                  onValueChange={async ([sliderValue]) => {
                    await saveToLocalStorage("pollingRate", sliderValue);
                    await handleSaveSliderToast();
                  }}
                  max={100}
                  step={50}
                  className={"mt-5 mb-5"}
                  id="request-rate-slider"
                />
                <AllSliderMarkers numMinsArr={[10, 5, 1]} />
              </div>
            </CardContent>
            <CardFooter className="mt-10"></CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="accessibility">
          <Card></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsComponent;
