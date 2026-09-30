"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Edit2, Check, X, Plus, RefreshCw, Tag, Search } from "lucide-react";
import AdminLoader from "@/components/admin/AdminLoader";
import { toast } from "sonner";
import DeleteDialog from "./delete-attribute-dialogue";
import { apiFetch } from "@/lib/api-client";
import { useRouter } from "next/navigation";

export interface AttributeValueItem {
  id: string;
  value: string;
}

export interface AttributeItem {
  id: string;
  name: string;
  values: AttributeValueItem[];
}

interface VariationsPageProps {
  initialData?: AttributeItem[];
}

export default function VariationsPage({ initialData = [] }: VariationsPageProps) {
  const [attributes, setAttributes] = useState<AttributeItem[]>(initialData);
  const [newAttrName, setNewAttrName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const refresh = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch("/attributes", { cache: "no-store" });
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setAttributes(data);
      } else {
        toast.error(data.error || "Failed to fetch attributes");
      }
    } catch (error) {
      console.error("Error fetching attributes:", error);
      toast.error("Network error while loading variations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData || initialData.length === 0) {
      refresh();
    }
  }, []);

  const handleCreateAttribute = async () => {
    if (!newAttrName.trim()) return;
    setIsLoading(true);
    try {
      const response = await apiFetch("/attributes", {
        method: "POST",
        body: JSON.stringify({ name: newAttrName.trim() }),
      });
      const result = await response.json();
      if (response.ok) {
        setNewAttrName("");
        await refresh();
        router.refresh();
        toast.success("Attribute created successfully");
      } else {
        toast.error(result.error || "Failed to create attribute");
      }
    } catch {
      toast.error("An error occurred while creating attribute");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameAttribute = async (id: string, name: string) => {
    if (!name.trim()) return;
    try {
      const response = await apiFetch(`/attributes/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim() }),
      });
      const result = await response.json();
      if (response.ok) {
        await refresh();
        router.refresh();
        toast.success("Attribute updated successfully");
      } else {
        toast.error(result.error || "Failed to update attribute");
      }
    } catch {
      toast.error("An error occurred while updating attribute");
    }
  };

  const handleDeleteAttribute = async (id: string) => {
    try {
      const response = await apiFetch(`/attributes/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (response.ok) {
        await refresh();
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to delete attribute");
      }
    } catch (error: unknown) {
      const err = error as Error;
      throw new Error(err.message || "An error occurred");
    }
  };

  const handleAddValue = async (attributeId: string, value: string) => {
    if (!value.trim()) return;
    try {
      const response = await apiFetch(`/attributes/${attributeId}/values`, {
        method: "POST",
        body: JSON.stringify({ value: value.trim() }),
      });
      const result = await response.json();
      if (response.ok) {
        await refresh();
        router.refresh();
        toast.success("Value added successfully");
      } else {
        toast.error(result.error || "Failed to add value");
      }
    } catch {
      toast.error("An error occurred while adding value");
    }
  };

  const handleUpdateValue = async (id: string, value: string) => {
    if (!value.trim()) return;
    try {
      const response = await apiFetch(`/attributes/values/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ value: value.trim() }),
      });
      const result = await response.json();
      if (response.ok) {
        await refresh();
        router.refresh();
        toast.success("Value updated successfully");
      } else {
        toast.error(result.error || "Failed to update value");
      }
    } catch {
      toast.error("An error occurred while updating value");
    }
  };

  const handleDeleteValue = async (id: string) => {
    try {
      const response = await apiFetch(`/attributes/values/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (response.ok) {
        await refresh();
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to delete value");
      }
    } catch (error: unknown) {
      const err = error as Error;
      throw new Error(err.message || "An error occurred");
    }
  };

  const filteredAttributes = attributes.filter((attr) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      attr.name.toLowerCase().includes(q) ||
      attr.values.some((v) => v.value.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 min-w-64 flex-1 md:flex-none">
          <Input
            placeholder="Create new attribute (e.g. Size, Color)"
            value={newAttrName}
            onChange={(e) => setNewAttrName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newAttrName.trim()) {
                handleCreateAttribute();
              }
            }}
            className="w-72"
          />
          <Button
            onClick={handleCreateAttribute}
            className="cursor-pointer"
            disabled={isLoading || !newAttrName.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add attribute
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-60">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter variations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading && attributes.length === 0 ? (
        <AdminLoader label="Loading attributes..." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAttributes.map((attr) => (
            <Card key={attr.id} className="flex h-[380px] flex-col border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="cursor-pointer hover:bg-accent px-2 py-1 rounded-md">
                  <InlineEditableText
                    initialValue={attr.name}
                    onSave={(val) => handleRenameAttribute(attr.id, val)}
                    isHeader
                    deleteDialog={
                      <DeleteDialog
                        itemName={attr.name}
                        itemType="attribute"
                        onDelete={() => handleDeleteAttribute(attr.id)}
                        warningMessage={
                          attr.values.length > 0
                            ? `This will also delete ${attr.values.length} associated ${
                                attr.values.length === 1 ? "value" : "values"
                              }.`
                            : undefined
                        }
                        showOnHover
                      />
                    }
                  />
                </CardTitle>
              </CardHeader>
              <div className="w-full px-3">
                <Separator orientation="horizontal" />
              </div>
              <CardContent className="pt-4 flex flex-1 flex-col overflow-hidden">
                <div className="space-y-1.5 mb-3 flex-1 overflow-y-auto pr-1">
                  {attr.values.map((v) => (
                    <div
                      className="hover:bg-accent px-2 py-1 rounded-md cursor-pointer text-sm"
                      key={v.id}
                    >
                      <InlineEditableText
                        initialValue={v.value}
                        onSave={(val) => handleUpdateValue(v.id, val)}
                        deleteDialog={
                          <DeleteDialog
                            itemName={v.value}
                            itemType="attribute value"
                            onDelete={() => handleDeleteValue(v.id)}
                            showOnHover
                          />
                        }
                      />
                    </div>
                  ))}
                  {attr.values.length === 0 && (
                    <div className="text-xs text-muted-foreground py-4 text-center">
                      No values yet. Add one below.
                    </div>
                  )}
                </div>
                <div className="mt-auto pt-3 border-t">
                  <InlineAddValue
                    onAdd={(val) => handleAddValue(attr.id, val)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredAttributes.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Tag className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      {searchQuery ? "No matching attributes" : "No attributes found"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery
                        ? "Try clearing the search filter."
                        : "Create your first variation attribute to get started."}
                    </p>
                  </div>
                  {!searchQuery && (
                    <div className="pt-2">
                      <Button
                        onClick={handleCreateAttribute}
                        disabled={!newAttrName.trim()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add attribute
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}


function InlineEditableText({
  initialValue,
  onSave,
  deleteDialog,
  isHeader,
}: {
  initialValue: string;
  onSave: (value: string) => void;
  deleteDialog?: React.ReactNode;
  isHeader?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const [editing, setEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => setValue(initialValue), [initialValue]);

  const handleSave = () => {
    if (value.trim() && value !== initialValue) {
      onSave(value.trim());
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setValue(initialValue);
    setEditing(false);
  };

  return (
    <div
      className="flex items-center justify-between w-full group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {editing ? (
        <>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSave();
              } else if (e.key === "Escape") {
                handleCancel();
              }
            }}
            className="flex-1"
            autoFocus
          />
          <div className="flex items-center gap-2 ml-2">
            <Button size="sm" onClick={handleSave}>
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <span className={isHeader ? "font-semibold text-base" : "text-sm"}>
            {initialValue}
          </span>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditing(true)}
              className={`${
                isHovered ? "opacity-100 cursor-pointer" : "opacity-0"
              } transition-opacity`}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            {deleteDialog && (
              <div
                className={`${
                  isHovered ? "opacity-100" : "opacity-0"
                } transition-opacity`}
              >
                {deleteDialog}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function InlineAddValue({ onAdd }: { onAdd: (value: string) => void }) {
  const [value, setValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (value.trim()) {
      onAdd(value.trim());
      setValue("");
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setValue("");
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsAdding(true)}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Value
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="New value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleAdd();
          } else if (e.key === "Escape") {
            handleCancel();
          }
        }}
        autoFocus
      />
      <Button size="sm" onClick={handleAdd} disabled={!value.trim()}>
        <Check className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={handleCancel}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
