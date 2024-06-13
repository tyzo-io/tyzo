import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useConfig } from "@/Editor/Context";
import type {
  EditorInput,
  PageElement,
  ElementContainer,
  InputMap,
  ComponentInfo,
  StringProperty,
} from "@tyzo/page-editor";

function Image({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const config = useConfig();
  return (
    <div>
      <Tabs defaultValue="file">
        <TabsList style={{ marginLeft: "0.5em", marginRight: "0.5em" }}>
          <TabsTrigger value="file">Upload</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
        </TabsList>
        <TabsContent value="file">
          <Input
            style={{ marginLeft: "0.5em", marginRight: "0.5em" }}
            type="file"
            disabled={isUploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                setIsUploading(true);
                const id = crypto.randomUUID();
                const publicOrPrivate = "public";
                const { url } = await config.fileStore.add(
                  `${publicOrPrivate}/${id}/${file.name}`,
                  file
                );
                onChange(url);
                setIsUploading(false);
              }
            }}
          />
        </TabsContent>
        <TabsContent value="url">
          <Input
            style={{ marginLeft: "0.5em", marginRight: "0.5em" }}
            value={value}
            type="url"
            onChange={(e) => onChange(e.target.value)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const ImageProps: EditorInput<{
  property: StringProperty;
  element: PageElement;
  elementContainer: ElementContainer;
  components: ComponentInfo[];
  inputs: InputMap;
  value: any;
  setValue: (value: any) => void;
}> = function ImageProps(props) {
  return (
    <Image
      value={props.value}
      onChange={(value) => props.setValue(value as any)}
    />
  );
};
