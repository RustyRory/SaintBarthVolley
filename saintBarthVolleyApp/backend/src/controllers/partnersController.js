import Partner from '../models/Partner.js';

// Liste des partenaires (actifs par défaut)
export const getPartners = async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };

    const partners = await Partner.find(filter).sort({ priority: 1, createdAt: -1 });

    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Partenaire par ID
export const getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({ message: 'Partenaire non trouvé' });
    }

    res.json(partner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer un partenaire
export const createPartner = async (req, res) => {
  try {
    const partner = await Partner.create(req.body);
    res.status(201).json(partner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mettre à jour un partenaire
export const updatePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!partner) {
      return res.status(404).json({ message: 'Partenaire non trouvé' });
    }

    res.json(partner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Activer / désactiver
export const togglePartnerStatus = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({ message: 'Partenaire non trouvé' });
    }

    partner.isActive = !partner.isActive;
    await partner.save();

    res.json(partner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer un partenaire
export const deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);

    if (!partner) {
      return res.status(404).json({ message: 'Partenaire non trouvé' });
    }

    res.json({ message: 'Partenaire supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
