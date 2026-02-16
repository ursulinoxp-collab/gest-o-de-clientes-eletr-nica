
import { jsPDF } from 'jspdf';
import { ServiceOrder, ServiceStatus } from '../types';

export const generateOrderPDF = (order: ServiceOrder) => {
  try {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 25;

    // Header Branding
    doc.setFillColor(249, 115, 22); // Orange-500
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('PONTO DA ELETRÔNICA', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const title = order.status === ServiceStatus.ORCAMENTO ? 'ORÇAMENTO DE SERVIÇO' : 'ORDEM DE SERVIÇO';
    doc.text(`${title} #${order.id.slice(0, 8).toUpperCase()}`, pageWidth / 2, 30, { align: 'center' });

    doc.setTextColor(30, 41, 59);
    currentY = 55;

    // Cliente Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. DADOS DO CLIENTE', margin, currentY);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    currentY += 10;
    doc.text(`Nome: ${order.customerName}`, margin, currentY);
    currentY += 6;
    doc.text(`Telefone: ${order.customerPhone}`, margin, currentY);
    currentY += 6;
    const addr = doc.splitTextToSize(`Endereço: ${order.customerAddress || 'N/A'}`, pageWidth - 40);
    doc.text(addr, margin, currentY);
    currentY += (addr.length * 6) + 5;

    // Equipamento Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. EQUIPAMENTO', margin, currentY);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    currentY += 10;
    doc.text(`Equipamento: ${order.equipmentType} ${order.equipmentBrand}`, margin, currentY);
    currentY += 6;
    const defect = doc.splitTextToSize(`Defeito Relatado: ${order.reportedDefect || 'Não informado'}`, pageWidth - 40);
    doc.text(defect, margin, currentY);
    currentY += (defect.length * 6) + 5;

    // Serviço Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. DETALHES DO SERVIÇO', margin, currentY);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
    
    currentY += 10;
    doc.setFont('helvetica', 'normal');
    const serviceText = doc.splitTextToSize(`Serviço Executado: ${order.servicePerformed || 'Em análise'}`, pageWidth - 40);
    doc.text(serviceText, margin, currentY);
    currentY += (serviceText.length * 6) + 5;

    doc.setFont('helvetica', 'bold');
    doc.text(`VALOR TOTAL: ${Number(order.serviceValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, margin, currentY);
    currentY += 6;
    doc.text(`GARANTIA: ${order.guaranteeDays} dias`, margin, currentY);
    currentY += 6;
    doc.text(`ENTRADA: ${new Date(order.arrivalDate).toLocaleDateString('pt-BR')}`, margin, currentY);

    // Fotos
    if (order.images && order.images.length > 0) {
      currentY += 15;
      if (currentY > 220) { doc.addPage(); currentY = 20; }
      doc.text('ANEXOS:', margin, currentY);
      currentY += 10;
      
      let x = margin;
      order.images.forEach((img) => {
        try {
          const format = img.includes('png') ? 'PNG' : 'JPEG';
          doc.addImage(img, format, x, currentY, 40, 30);
          x += 45;
          if (x > 160) { x = margin; currentY += 35; }
        } catch (e) { console.error(e); }
      });
    }

    // Assinatura Footer
    const footerY = 275;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.line(pageWidth / 2 - 40, footerY - 10, pageWidth / 2 + 40, footerY - 10);
    doc.text('Assinatura do Cliente', pageWidth / 2, footerY - 5, { align: 'center' });
    doc.text('Ponto da Eletrônica - Excelência em Assistência Técnica', pageWidth / 2, footerY + 5, { align: 'center' });

    const filename = `os_${order.customerName.toLowerCase().replace(/\s/g, '_')}_${order.id.slice(0,4)}.pdf`;
    doc.save(filename);
  } catch (err) {
    console.error(err);
    alert("Erro ao gerar PDF. Tente novamente.");
  }
};
