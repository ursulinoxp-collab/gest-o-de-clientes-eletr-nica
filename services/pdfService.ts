import { jsPDF } from 'jspdf';
import { ServiceOrder, ServiceStatus } from '../types';

const safeStr = (val: any) => {
  if (val === undefined || val === null) return '---';
  return String(val).trim() || '---';
};

const formatPdfDate = (dateStr: string) => {
  if (!dateStr || dateStr.trim() === "") return '---';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const sanitizeFileName = (name: string) => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toUpperCase();
};

export const generateOrderPDF = async (order: ServiceOrder) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let currentY = 25;

    const checkPage = (needed: number) => {
      if (currentY + needed > pageHeight - 20) {
        doc.addPage();
        currentY = 25;
        return true;
      }
      return false;
    };

    // --- CABEÇALHO ---
    doc.setFillColor(249, 115, 22); 
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('PONTO DA ELETRÔNICA', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const title = order.status === ServiceStatus.ORCAMENTO ? 'ORÇAMENTO DE SERVIÇO' : 'ORDEM DE SERVIÇO';
    doc.text(`${title} #${safeStr(order.id).slice(0, 8).toUpperCase()}`, pageWidth / 2, 30, { align: 'center' });

    doc.setTextColor(30, 41, 59);
    currentY = 55;

    // --- 1. DADOS DO CLIENTE ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. DADOS DO CLIENTE', margin, currentY);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    currentY += 10;
    doc.text(`Nome: ${safeStr(order.customerName)}`, margin, currentY);
    currentY += 6;
    doc.text(`WhatsApp: ${safeStr(order.customerPhone)}`, margin, currentY);
    currentY += 6;
    const addr = doc.splitTextToSize(`Endereço: ${safeStr(order.customerAddress)}`, pageWidth - (margin * 2));
    doc.text(addr, margin, currentY);
    currentY += (addr.length * 5) + 8;

    // --- 2. EQUIPAMENTO ---
    checkPage(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. EQUIPAMENTO', margin, currentY);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    currentY += 10;
    const eqType = order.equipmentType === 'Outros' ? (order.equipmentCustomType || 'Outros') : order.equipmentType;
    doc.text(`Aparelho: ${safeStr(eqType)}`, margin, currentY);
    currentY += 6;
    doc.text(`Marca/Modelo: ${safeStr(order.equipmentBrand)}`, margin, currentY);
    currentY += 6;
    const defectLines = doc.splitTextToSize(`Defeito: ${safeStr(order.reportedDefect)}`, pageWidth - (margin * 2));
    doc.text(defectLines, margin, currentY);
    currentY += (defectLines.length * 5) + 8;

    // --- 3. SERVIÇO ---
    checkPage(40);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. SERVIÇO REALIZADO', margin, currentY);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    currentY += 10;
    const serviceText = order.servicePerformed || 'Aguardando avaliação técnica.';
    const serviceLines = doc.splitTextToSize(serviceText, pageWidth - (margin * 2));
    serviceLines.forEach((line: string) => {
      if(checkPage(6)) currentY += 5;
      doc.text(line, margin, currentY);
      currentY += 5;
    });
    currentY += 5;

    // --- 4. FINANCEIRO ---
    checkPage(40);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('4. INFORMAÇÕES FINAIS', margin, currentY);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    currentY += 10;
    doc.text(`Entrada: ${formatPdfDate(order.arrivalDate)}`, margin, currentY);
    currentY += 6;
    doc.text(`Saída: ${formatPdfDate(order.deliveryDate)}`, margin, currentY);
    currentY += 6;
    doc.text(`Garantia: ${order.guaranteeDays === 0 ? 'Sem Garantia' : order.guaranteeDays + ' dias'}`, margin, currentY);
    currentY += 10;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const valorTotal = Number(order.serviceValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    doc.text(`VALOR TOTAL: ${valorTotal}`, margin, currentY);
    
    // --- IMAGENS ---
    if (order.images && order.images.length > 0) {
      currentY += 15;
      checkPage(45);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('FOTOS EM ANEXO:', margin, currentY);
      currentY += 10;
      
      let xPos = margin;
      for (const img of order.images) {
        try {
          if (!img) continue;
          checkPage(35);
          // Detecção básica de formato para o jsPDF
          let format = 'JPEG';
          if (img.includes('image/png')) format = 'PNG';
          if (img.includes('image/webp')) format = 'WEBP';
          
          doc.addImage(img, format, xPos, currentY, 40, 30, undefined, 'MEDIUM');
          xPos += 45;
          if (xPos > pageWidth - 50) {
            xPos = margin;
            currentY += 35;
          }
        } catch (imgError) {
          console.warn("Falha ao adicionar imagem ao PDF", imgError);
        }
      }
    }

    // --- RODAPÉ ---
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Ponto da Eletrônica - Gestão de Assistência Técnica', pageWidth / 2, footerY, { align: 'center' });

    // --- DOWNLOAD ---
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    const safeName = sanitizeFileName(order.customerName || 'DOC');
    link.href = url;
    link.download = `OS_${safeName}_${order.id.split('-')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (err) {
    console.error("Erro fatal na geração do PDF:", err);
    alert("Erro ao processar o PDF. Certifique-se de que as imagens não são excessivamente pesadas.");
  }
};