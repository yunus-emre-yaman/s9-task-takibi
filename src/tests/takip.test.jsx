import { beforeEach, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import path from "path";
import fs from "fs";
import App from "../App.jsx";

const pjPath = path.resolve(__dirname, "./../../package.json");
const pkg = JSON.parse(fs.readFileSync(pjPath, "utf-8"));

const appPath = path.resolve(__dirname, "./../App.jsx");
const appCode = fs.readFileSync(appPath, "utf-8");

test("react-toastify ve react-hook-form paketleri kurulmuş mu?", () => {
  expect(
    pkg.dependencies["react-toastify"] || pkg.devDependencies["react-hook-form"]
  ).toBeDefined();
  expect(
    pkg.dependencies["react-hook-form"] || pkg.devDependencies["react-toastify"]
  ).toBeDefined();
});

beforeEach(() => {
  render(<App />);
});

test("Task başlığı alanına 2 karakter girilince hata mesajı doğru metinle çıkıyor mu?", async () => {
  const user = userEvent.setup();
  const title = screen.getByLabelText(/Başlık/i);
  await user.type(title, "Em");
  await screen.findByText(/Task başlığı en az 3 karakter olmalı/i);
});

test("Task başlığı alanına yazılanlar silinince hata mesajı doğru metinle çıkıyor mu?", async () => {
  const user = userEvent.setup();
  const title = screen.getByLabelText(/Başlık/i);
  await user.type(title, "Em");
  await user.clear(title);
  await screen.findByText(/Task başlığı yazmalısınız/i);
});

test("Task açıklama alanına 2 karakter girilince hata mesajı doğru metinle çıkıyor mu?", async () => {
  const user = userEvent.setup();
  const desc = screen.getByLabelText(/Açıklama/i);
  await user.type(desc, "123456789");
  await screen.findByText(/Task açıklaması en az 10 karakter olmalı/i);
});

test("Task açıklama alanına yazılanlar silinince hata mesajı doğru metinle çıkıyor mu?", async () => {
  const user = userEvent.setup();
  const desc = screen.getByLabelText(/Açıklama/i);
  await user.type(desc, "123456789");
  await user.clear(desc);
  await screen.findByText(/Task açıklaması yazmalısınız/i);
});

test("Taskı 4 kişiye atayınca hata mesajı doğru metinle çıkıyor mu?", async () => {
  const user = userEvent.setup();
  const assignee = screen.getByLabelText(/İsim/i);
  const addButton = screen.getByText("Ekle");
  await user.type(assignee, "Erdem");
  await user.click(addButton);
  await user.type(assignee, "Ayşe");
  await user.click(addButton);
  await user.type(assignee, "Hakan");
  await user.click(addButton);
  await user.type(assignee, "Mahmut");
  await user.click(addButton);

  await user.click(await screen.findByText("Erdem"));
  await user.click(await screen.findByText("Ayşe"));
  await user.click(await screen.findByText("Hakan"));
  await user.click(await screen.findByText("Mahmut"));
  await screen.findByText(/En fazla 3 kişi seçebilirsiniz/i);
});

test("Taskı 1 kişiye atayıp, o kişi çıkarılınca hata mesajı doğru metin ile çıkıyor mu?", async () => {
  const user = userEvent.setup();
  const assignee = screen.getByLabelText(/İsim/i);
  const addButton = screen.getByText("Ekle");
  await user.type(assignee, "Erdem");
  await user.click(addButton);

  const erdem = await screen.findByText("Erdem");
  await user.click(erdem);
  await user.click(erdem);
  await screen.findByText(/Lütfen en az bir kişi seçin/i);
});

test("Bir taskta tamamlandı butonuna tıklayınca görev tamamlandı oluyor mu?", async () => {
  const user = userEvent.setup();
  const button = screen.getAllByText("Tamamlandı");
  await user.click(button[0]);
  const tamamlanmamisGorevler = await screen.findAllByText("Tamamlandı");
  expect(tamamlanmamisGorevler).toHaveLength(2);
});

test("App.jsx'e toastify import edilmiş mi?", async () => {
  expect(appCode.includes("react-toastify")).toBe(true);
});

test('Yeni kişi eklendiğinde "Yeni kişi oluşturuldu." toast mesajı gösteriliyor mu?', async () => {
  const user = userEvent.setup();
  const assignee = screen.getByLabelText(/İsim/i);
  const addButton = screen.getByText("Ekle");
  await user.type(assignee, "Erdem");
  await user.click(addButton);

  await screen.findByText("Yeni kişi oluşturuldu.");
});

test('3.2 Yeni görev eklendiğinde "Yeni görev oluşturuldu." toast mesajı gösteriliyor mu?', async () => {
  const user = userEvent.setup();
  const title = screen.getByLabelText(/Başlık/i);
  const desc = screen.getByLabelText(/Açıklama/i);
  const assignee = screen.getByLabelText(/İsim/i);
  const addButton = screen.getByText("Ekle");
  const kaydetButton = screen.getByText("Kaydet");

  await user.type(assignee, "Erdem");
  await user.click(addButton);
  await user.type(title, "Test görevi");
  await user.type(desc, "Test görevinin açıklaması");
  const erdem = await screen.findByText("Erdem");
  await user.click(erdem);
  await user.click(kaydetButton);

  await screen.findByText("Yeni görev oluşturuldu.");
});

test('3.3 Tamamlandı butonuna tıklayınca "... id\'li görev tamamlandı." toast mesajı gösteriliyor mu?', async () => {
  const user = userEvent.setup();
  const button = screen.getAllByText("Tamamlandı");
  await user.click(button[0]);
  const tamamlanmamisGorevler = await screen.findByText(
    "id'li görev tamamlandı.",
    { exact: false }
  );

  console.log(tamamlanmamisGorevler, 123);
  expect(tamamlanmamisGorevler).toBeInTheDocument();
});
