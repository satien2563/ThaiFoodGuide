// screens/admin/ManageUsersScreen.js
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette } from "../../styles/colors";

const INITIAL_USERS = [
  { id: "u1", name: "Oliver Smith",   email: "oliver.smith@example.com" },
  { id: "u2", name: "Amelia Johnson", email: "amelia.johnson@example.com" },
  { id: "u3", name: "James Brown",    email: "james.brown@example.com" },
  { id: "u4", name: "Xia Chen (陈霞)", email: "xia.chen@example.com" },
  { id: "u5", name: "Yuan Liu (刘远)", email: "yuan.liu@example.com" },
];

export default function ManageUsersScreen() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState("");

  // add / edit modal
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // user| null
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");

  // delete confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(null); // user| null

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  const openAdd = () => {
    setEditing(null);
    setFormName("");
    setFormEmail("");
    setFormOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormOpen(true);
  };

  const saveForm = () => {
    const name = formName.trim();
    const email = formEmail.trim();
    if (!name || !email) return;

    if (editing) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editing.id ? { ...u, name, email } : u))
      );
    } else {
      const id = "u" + Math.random().toString(36).slice(2, 8);
      setUsers((prev) => [{ id, name, email }, ...prev]);
    }
    setFormOpen(false);
    setEditing(null);
    setFormName("");
    setFormEmail("");
  };

  const askDelete = (u) => {
    setPending(u);
    setConfirmOpen(true);
  };

  const doDelete = () => {
    if (!pending) return;
    setUsers((prev) => prev.filter((u) => u.id !== pending.id));
    setPending(null);
    setConfirmOpen(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Ionicons name="person-circle-outline" size={28} color={palette.primary600} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
      </View>
      <TouchableOpacity
        style={[styles.iconBtn]}
        onPress={() => openEdit(item)}
        activeOpacity={0.85}
      >
        <Ionicons name="create-outline" size={18} color={palette.ink} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.iconBtn, { marginLeft: 6 }]}
        onPress={() => askDelete(item)}
        activeOpacity={0.85}
      >
        <Ionicons name="trash-outline" size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Add button */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd} activeOpacity={0.9}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addBtnTxt}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search box */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#6b7280" style={{ marginRight: 8 }} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search users..."
          style={{ flex: 1, paddingVertical: 8 }}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")} style={styles.clearBtn}>
            <Ionicons name="close" size={16} color="#111827" />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(u) => u.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={24} color="#9aa1ad" />
            <Text style={{ marginTop: 6, color: "#9aa1ad" }}>No users found</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={formOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFormOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setFormOpen(false)}>
          <View />
        </Pressable>
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? "Edit user" : "Add user"}</Text>

            <View style={{ marginTop: 10 }}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                value={formName}
                onChangeText={setFormName}
                style={styles.input}
                placeholder="Oliver Smith"
              />
            </View>
            <View style={{ marginTop: 10 }}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={formEmail}
                onChangeText={setFormEmail}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="oliver.smith@example.com"
              />
            </View>

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.btn, styles.btnGhost]}
                onPress={() => setFormOpen(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.btnGhostTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={saveForm}
                activeOpacity={0.9}
              >
                <Text style={styles.btnPrimaryTxt}>{editing ? "Save" : "Add"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        visible={confirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setConfirmOpen(false)}>
          <View />
        </Pressable>
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons name="warning-outline" size={22} color="#f59e0b" />
            </View>
            <Text style={styles.modalTitle}>Are you sure you want to delete this user?</Text>
            {pending?.name ? (
              <Text style={styles.modalSubtitle} numberOfLines={2}>
                {pending.name} — {pending.email}
              </Text>
            ) : null}

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.btn, styles.btnGhost]}
                onPress={() => setConfirmOpen(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.btnGhostTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnDanger]} // 🔴 ปุ่มแดง (เน้น)
                onPress={doDelete}
                activeOpacity={0.9}
              >
                <Text style={styles.btnDangerTxt}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg, padding: 16 },

  topBar: { marginBottom: 10, flexDirection: "row", justifyContent: "flex-end" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: palette.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addBtnTxt: { color: "#fff", fontWeight: "800" },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: palette.bg,
    marginBottom: 8,
  },
  clearBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    marginLeft: 8,
  },

  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  sep: { height: 1, backgroundColor: palette.border },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#d1fae5",
  },

  name: { fontSize: 16, fontWeight: "700", color: palette.ink },
  email: { fontSize: 12, color: palette.ink60, marginTop: 2 },

  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: palette.border,
  },

  // Modal shared
  backdrop: {
    position: "absolute",
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    padding: 16,
  },
  modalIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#fffbeb",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#fef3c7",
    marginBottom: 10,
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  modalSubtitle: { marginTop: 4, color: "#6b7280" },
  modalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 14, gap: 8 },

  btn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhost: { backgroundColor: "#f3f4f6", borderWidth: 1, borderColor: "#e5e7eb" },
  btnGhostTxt: { fontWeight: "800", color: "#111827" },

  btnPrimary: { backgroundColor: palette.primary },
  btnPrimaryTxt: { color: "#fff", fontWeight: "800" },

  btnDanger: { backgroundColor: "#ef4444" },
  btnDangerTxt: { color: "#fff", fontWeight: "800" },
});
